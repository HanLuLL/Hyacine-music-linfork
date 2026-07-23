package expo.modules.glassbackdrop

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.PixelCopy
import android.view.View
import android.view.Window
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.max

private const val TAG = "GlassBackdropView"

/**
 * 真液态玻璃视图：基于 PixelCopy 背景捕获 + RenderEffect 自身模糊。
 *
 * 核心原理（与 expo-liquid-glass 的根本区别）：
 * - expo-liquid-glass 把 RenderEffect 应用在自身，但自身没有绘制内容，所以模糊了"空"，等于透明
 * - 本 View 在 onDraw 里先画从 PixelCopy 捕获的下层 bitmap，再由 RenderEffect 模糊"自身绘制的内容"
 *   即模糊了刚画的下层 bitmap → 实现真玻璃模糊效果
 *
 * 实现分级：
 * - API 31+（Android 12）：PixelCopy 捕获 + RenderEffect.createBlurEffect 真玻璃
 * - API < 31 或 PixelCopy 连续失败：降级到半透明实色
 *
 * 性能策略：
 * - 30fps 捕获帧率（每 ~33ms 一次 PixelCopy）
 * - 降采样 0.5 倍（宽度/2, 高度/2），减少内存分配与模糊开销
 * - 仅在 attached 且 visible 时捕获
 * - 不主动 recycle 旧 bitmap（避免 RenderEffect GPU 异步引用已释放内存），让 GC 处理
 */
class GlassBackdropView(context: Context) : View(context) {

    // --- Props（由 Expo ViewManager 设置）---
    var blurRadiusPx: Float = 12f
        set(value) { field = value; updateRenderEffect() }
    var tintColorArgb: Int = 0x2EFFFFFF
        set(value) { field = value; invalidate() }

    // --- 内部状态 ---
    private var capturedBitmap: Bitmap? = null
    private val srcRect = Rect()
    private val dstRectF = RectF()
    private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        isFilterBitmap = true
    }
    private val tintPaint = Paint(Paint.ANTI_ALIAS_FLAG)

    private val realGlassSupported: Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    private var degraded: Boolean = false
    private var captureJob: Job? = null
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    init {
        setWillNotDraw(false)
        setBackgroundColor(Color.TRANSPARENT)
        updateRenderEffect()
        Log.i(TAG, "init: realGlassSupported=$realGlassSupported sdk=${Build.VERSION.SDK_INT}")
    }

    /** 配置/更新 RenderEffect（API 31+）。blurRadius=0 或降级时移除。 */
    private fun updateRenderEffect() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        if (degraded || blurRadiusPx <= 0f) {
            setRenderEffect(null)
        } else {
            setRenderEffect(
                RenderEffect.createBlurEffect(blurRadiusPx, blurRadiusPx, Shader.TileMode.CLAMP)
            )
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        if (degraded || !realGlassSupported) {
            // 降级模式：半透明实色
            tintPaint.color = tintColorArgb
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), tintPaint)
            return
        }

        // 真玻璃模式：先画捕获的下层 bitmap（RenderEffect 会模糊这段绘制）
        capturedBitmap?.let { bmp ->
            srcRect.set(0, 0, bmp.width, bmp.height)
            dstRectF.set(0f, 0f, width.toFloat(), height.toFloat())
            canvas.drawBitmap(bmp, srcRect, dstRectF, bitmapPaint)
        }

        // 叠加 tint 层（提升可读性，Color 已含 alpha，Canvas 自动混合）
        tintPaint.color = tintColorArgb
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), tintPaint)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startCaptureLoop()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopCaptureLoop()
    }

    private fun startCaptureLoop() {
        if (!realGlassSupported || degraded) return
        captureJob?.cancel()
        captureJob = scope.launch {
            var consecutiveFails = 0
            while (true) {
                if (width > 0 && height > 0 && isShown && windowVisibility == VISIBLE) {
                    val bmp = captureBackground()
                    if (bmp != null) {
                        consecutiveFails = 0
                        // 不主动 recycle 旧 bitmap：RenderEffect 可能在 GPU 异步引用
                        // 让 GC 处理（30fps × 降采样 bitmap 分配量 GC 可承受）
                        capturedBitmap = bmp
                        invalidate()
                    } else {
                        consecutiveFails++
                        // 连续 30 次失败（约 1 秒）才降级
                        if (consecutiveFails > 30) {
                            Log.w(TAG, "PixelCopy failed $consecutiveFails times, degrade to solid color")
                            degraded = true
                            updateRenderEffect()
                            invalidate()
                            return@launch
                        }
                    }
                }
                delay(33) // 30fps
            }
        }
    }

    private fun stopCaptureLoop() {
        captureJob?.cancel()
        captureJob = null
    }

    /**
     * 通过 PixelCopy 捕获本 View 在窗口中所处位置的像素。
     * 降采样 0.5 倍以提升性能。
     *
     * 返回 null 表示当前不可捕获（窗口未就绪 / View 未 attach / 坐标无效）。
     */
    private fun captureBackground(): Bitmap? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return null

        val window = currentWindow ?: return null
        val w = width
        val h = height
        if (w <= 0 || h <= 0) return null

        // 计算本 View 在窗口中的绝对坐标
        val loc = IntArray(2)
        getLocationInWindow(loc)
        val x = loc[0]
        val y = loc[1]
        if (x < 0 || y < 0) return null

        // 降采样 0.5 倍
        val downsampleW = max(1, w / 2)
        val downsampleH = max(1, h / 2)

        val bitmap = try {
            Bitmap.createBitmap(downsampleW, downsampleH, Bitmap.Config.ARGB_8888)
        } catch (_: Throwable) {
            return null
        }

        val srcRect = Rect(x, y, x + w, y + h)

        return try {
            val latch = java.util.concurrent.CountDownLatch(1)
            var success = false

            PixelCopy.request(
                window,
                srcRect,
                bitmap,
                { copyResult ->
                    success = copyResult == PixelCopy.SUCCESS
                    latch.countDown()
                },
                Handler(Looper.getMainLooper())
            )

            // 同步等待结果（最长 50ms，避免阻塞主线程过久）
            if (!latch.await(50, java.util.concurrent.TimeUnit.MILLISECONDS)) {
                bitmap.recycle()
                return null
            }

            if (success) bitmap else {
                bitmap.recycle()
                null
            }
        } catch (_: Throwable) {
            try { bitmap.recycle() } catch (_: Throwable) {}
            null
        }
    }

    /** 获取当前 Activity 的 Window（处理 ContextWrapper 包装链）。 */
    private val currentWindow: Window?
        get() {
            var ctx: Context? = context
            while (ctx is android.content.ContextWrapper) {
                if (ctx is android.app.Activity) return ctx.window
                ctx = ctx.baseContext
            }
            return null
        }
}
