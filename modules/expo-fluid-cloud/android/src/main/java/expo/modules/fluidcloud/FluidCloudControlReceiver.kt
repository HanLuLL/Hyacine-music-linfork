package expo.modules.fluidcloud

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.session.MediaSessionManager
import android.os.SystemClock
import android.view.KeyEvent

/**
 * 接收 OPPO 流体云控制按钮点击事件，转发到活跃的 MediaSession。
 *
 * 工作流程（OPPO 官方推荐路径）：
 * 1. 用户点击流体云胶囊上的播放/暂停/上一首/下一首按钮
 * 2. 系统通过 PendingIntent 触发本 BroadcastReceiver
 * 3. 本 Receiver 通过 MediaSessionManager 获取活跃的 MediaSession
 * 4. 通过 dispatchMediaButtonEvent 把对应的 KeyEvent 分发到 MediaSession
 * 5. MediaSession.Callback（在 ExpoLiveUpdatesModule 中定义）回调 onPlay/onPause/onSkipToNext 等
 */
class FluidCloudControlReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            val action = intent.action ?: return

            // 获取活跃的 MediaSession
            val msm = context.getSystemService(Context.MEDIA_SESSION_SERVICE) as? MediaSessionManager ?: return
            @Suppress("DEPRECATION")
            val controllers = msm.getActiveSessions(null)
            if (controllers.isNullOrEmpty()) return

            // 取本 app 的 MediaSession（fallback 到第一个活跃 controller）
            val controller = controllers.firstOrNull { it.packageName == context.packageName }
                ?: controllers.firstOrNull()
                ?: return

            // 根据广播 action 映射到 KeyEvent
            val keyCode = when (action) {
                ACTION_PLAY -> KeyEvent.KEYCODE_MEDIA_PLAY
                ACTION_PAUSE -> KeyEvent.KEYCODE_MEDIA_PAUSE
                ACTION_NEXT -> KeyEvent.KEYCODE_MEDIA_NEXT
                ACTION_PREV -> KeyEvent.KEYCODE_MEDIA_PREVIOUS
                else -> return
            }

            // 模拟一次按键按下+抬起，触发 MediaSession.Callback
            val now = SystemClock.uptimeMillis()
            val downEvent = KeyEvent(now, now, KeyEvent.ACTION_DOWN, keyCode, 0)
            val upEvent = KeyEvent(now, now, KeyEvent.ACTION_UP, keyCode, 0)
            controller.dispatchMediaButtonEvent(downEvent)
            controller.dispatchMediaButtonEvent(upEvent)
        } catch (_: Throwable) {
            // 转发失败不影响系统 UI
        }
    }

    private fun <T> List<T>?.isNullOrEmpty(): Boolean {
        return this == null || this.isEmpty()
    }
}

// 控制按钮广播 Action（与 ExpoFluidCloudModule 中保持一致）
private const val ACTION_PLAY = "com.hyacine.music.FLUID_CLOUD_PLAY"
private const val ACTION_PAUSE = "com.hyacine.music.FLUID_CLOUD_PAUSE"
private const val ACTION_NEXT = "com.hyacine.music.FLUID_CLOUD_NEXT"
private const val ACTION_PREV = "com.hyacine.music.FLUID_CLOUD_PREV"
