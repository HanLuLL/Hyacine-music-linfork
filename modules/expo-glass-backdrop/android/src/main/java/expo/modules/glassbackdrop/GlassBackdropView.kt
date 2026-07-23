package expo.modules.glassbackdrop

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.PixelCopy
import android.view.Window
import android.widget.FrameLayout
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.AbstractComposeView
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import com.kyant.backdrop.api.blur
import com.kyant.backdrop.api.drawBackdrop
import com.kyant.backdrop.api.lens
import com.kyant.backdrop.api.rememberCanvasBackdrop
import com.kyant.backdrop.api.vibrancy
import kotlinx.coroutines.delay
import kotlin.math.max
import kotlin.math.roundToInt

private const val TAG = "GlassBackdropView"

/**
 * 真液态玻璃视图：基于 backdrop 库 + PixelCopy 背景捕获 + Compose 绘制。
 *
 * 与 expo-liquid-glass（RenderEffect 模糊自身内容，无法模糊下层）不同：
 * 本视图通过 PixelCopy 周期性捕获本 View 在窗口中所处位置的"下方像素"，
 * 交给 backdrop 库的 CanvasBackdrop 应用 blur + lens + vibrancy 效果链，
 * 实现真正的 iOS Liquid Glass 折射质感。
 *
 * 实现分级：
 * - API 31+：启用 PixelCopy + backdrop 全效果（blur + lens + vibrancy）
 * - API 33+：额外启用 lens 折射（依赖 RuntimeShader）
 * - API < 31 或 PixelCopy 连续失败：降级到半透明实色
 *
 * 性能策略：
 * - 30fps 捕获帧率（每 ~33ms 一次 PixelCopy）
 * - 降采样 0.5 倍（宽度/2, 高度/2），减少 GPU 上传与模糊开销
 * - 仅在 attached 且 visible 时捕获
 *
 * 实现要点：
 * - 所有可变 props 用 Compose mutableState 包装，变化时自动触发 recomposition
 * - 不主动 recycle 旧 bitmap，避免 backdrop 正在绘制时崩溃（让 GC 处理）
 */
class GlassBackdropView(context: Context) : FrameLayout(context) {

    // 所有 props 用 mutableState 包装，变化时触发 Compose recomposition
    var blurRadiusPx: Float by mutableFloatStateOf(12f)
    var cornerRadiusPx: Float by mutableFloatStateOf(28f)
    var lensHeightPx: Float by mutableFloatStateOf(6f)
    var lensEnabled: Boolean by mutableStateOf(true)
    var tintColorArgb: Int by mutableIntStateOf(0x2EFFFFFF)
    var highlightEnabled: Boolean by mutableStateOf(true)

    /**
     * 是否支持真玻璃（API 31+ 且 PixelCopy 可用）。
     * 非状态变量：初始化后不变。
     */
    private val realGlassSupported: Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S

    private val composeView: AbstractComposeView = object : AbstractComposeView(context) {
        @Composable
        override fun Content() {
            GlassBackdropContent()
        }
    }

    init {
        setWillNotDraw(false)
        setBackgroundColor(Color.TRANSPARENT)
        addView(composeView)
        Log.i(TAG, "init: realGlassSupported=$realGlassSupported sdk=${Build.VERSION.SDK_INT}")
    }

    @Composable
    private fun GlassBackdropContent() {
        // 捕获到的背景图（API 31+ 才有值）
        var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }
        // 是否已降级（PixelCopy 连续失败后）
        var isDegraded by remember { mutableStateOf(false) }

        // 真玻璃模式：启动 PixelCopy 捕获循环
        if (realGlassSupported && !isDegraded) {
            LaunchedEffect(Unit) {
                var consecutiveFails = 0
                while (true) {
                    if (width > 0 && height > 0 && isShown && windowVisibility == VISIBLE) {
                        val bmp = captureBackground()
                        if (bmp != null) {
                            consecutiveFails = 0
                            // 不主动 recycle 旧 bitmap，避免 backdrop 正在绘制时崩溃
                            // 让 GC 处理（30fps × 降采样 bitmap 分配量 GC 可承受）
                            capturedBitmap = bmp
                        } else {
                            consecutiveFails++
                            // 连续 30 次失败（约 1 秒）才降级
                            if (consecutiveFails > 30) {
                                Log.w(TAG, "PixelCopy failed $consecutiveFails times, degrade to solid color")
                                isDegraded = true
                            }
                        }
                    }
                    delay(33)
                }
            }
        }

        if (isDegraded || !realGlassSupported) {
            // 降级模式：半透明实色（与原 expo-liquid-glass 一致）
            Box(
                Modifier
                    .fillMaxSize()
                    .drawBehind {
                        drawRect(ComposeColor(tintColorArgb))
                    }
            )
            return
        }

        // 真玻璃模式：CanvasBackdrop + drawBackdrop
        val backdrop = rememberCanvasBackdrop {
            // DrawScope 上下文：把捕获的背景 bitmap 绘制到 backdrop canvas
            capturedBitmap?.let { bmp ->
                val imageBitmap: ImageBitmap = bmp.asImageBitmap()
                drawImage(
                    image = imageBitmap,
                    dstOffset = IntOffset(0, 0),
                    dstSize = IntSize(size.width.roundToInt(), size.height.roundToInt())
                )
            }
        }

        Box(
            Modifier
                .fillMaxSize()
                .drawBackdrop(
                    backdrop = backdrop,
                    effects = {
                        // 顺序：color filter → blur → lens（backdrop 文档要求）
                        vibrancy()
                        blur(blurRadiusPx)
                        if (lensEnabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            lens(lensHeightPx, cornerRadiusPx)
                        }
                    },
                    onDrawSurface = {
                        // 半透明 tint 层（提升可读性）
                        // ComposeColor(tintColorArgb) 已含 alpha，无需额外传 alpha（避免双重叠加）
                        drawRect(color = ComposeColor(tintColorArgb))
                    }
                )
        )
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
        val width = width
        val height = height
        if (width <= 0 || height <= 0) return null

        // 计算本 View 在窗口中的绝对坐标
        val loc = IntArray(2)
        getLocationInWindow(loc)
        val x = loc[0]
        val y = loc[1]
        if (x < 0 || y < 0) return null

        // 降采样 0.5 倍
        val downsampleW = max(1, (width / 2))
        val downsampleH = max(1, (height / 2))

        val bitmap = try {
            Bitmap.createBitmap(downsampleW, downsampleH, Bitmap.Config.ARGB_8888)
        } catch (_: Throwable) {
            return null
        }

        val srcRect = Rect(x, y, x + width, y + height)

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

            // 同步等待结果（最长 50ms，避免阻塞 Compose 帧过久）
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

    private val currentWindow: Window?
        get() {
            val ctx = context
            return if (ctx is android.app.Activity) ctx.window else null
        }
}
