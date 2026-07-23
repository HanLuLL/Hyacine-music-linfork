package expo.modules.glassbackdrop

import android.graphics.Color
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "ExpoGlassBackdropModule"

/**
 * Expo 模块定义：暴露 GlassBackdropView 给 React Native。
 *
 * 与 expo-liquid-glass 模块的区别：
 * - expo-liquid-glass：使用 RenderEffect 模糊 View 自身内容，无法模糊下层（旧）
 * - expo-glass-backdrop：使用 backdrop 库 + PixelCopy 捕获下层像素，真玻璃（新）
 *
 * Props（单位均为 px，JS 端通过 PixelRatio.dpToPx 转换）：
 * - blurRadius: number（默认 12px）— 模糊半径
 * - cornerRadius: number（默认 28px）— 圆角半径
 * - lensHeight: number（默认 6px）— lens 折射高度（API 33+）
 * - lensEnabled: boolean（默认 true）— 是否启用 lens 折射
 * - tintColor: string（默认 rgba(255,255,255,0.18)）— 玻璃 tint 色
 * - highlightEnabled: boolean（默认 true）— 是否显示顶部高光
 */
class ExpoGlassBackdropModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoGlassBackdrop")

        View(GlassBackdropView::class) {
            Prop("blurRadius") { view: GlassBackdropView, value: Double ->
                view.blurRadiusPx = value.toFloat()
                Log.v(TAG, "Prop blurRadius=$value")
            }
            Prop("cornerRadius") { view: GlassBackdropView, value: Double ->
                view.cornerRadiusPx = value.toFloat()
                Log.v(TAG, "Prop cornerRadius=$value")
            }
            Prop("lensHeight") { view: GlassBackdropView, value: Double ->
                view.lensHeightPx = value.toFloat()
            }
            Prop("lensEnabled") { view: GlassBackdropView, value: Boolean ->
                view.lensEnabled = value
            }
            Prop("tintColor") { view: GlassBackdropView, value: String ->
                view.tintColorArgb = parseColor(value, default = 0x2EFFFFFF)
            }
            Prop("highlightEnabled") { view: GlassBackdropView, value: Boolean ->
                view.highlightEnabled = value
            }
        }
    }

    /** 解析 rgba(...) / #RRGGBB / #AARRGGBB 字符串。失败回退 default。 */
    private fun parseColor(value: String, default: Int): Int {
        return try {
            val trimmed = value.trim()
            if (trimmed.startsWith("rgba(") || trimmed.startsWith("rgb(")) {
                val inner = trimmed.substringAfter('(').substringBefore(')')
                val parts = inner.split(',').map { it.trim().toFloat() }
                val r = parts.getOrNull(0)?.toInt() ?: 255
                val g = parts.getOrNull(1)?.toInt() ?: 255
                val b = parts.getOrNull(2)?.toInt() ?: 255
                val a = parts.getOrNull(3) ?: 1f
                Color.argb((a.coerceIn(0f, 1f) * 255).toInt(), r, g, b)
            } else {
                Color.parseColor(trimmed)
            }
        } catch (_: Throwable) {
            default
        }
    }
}
