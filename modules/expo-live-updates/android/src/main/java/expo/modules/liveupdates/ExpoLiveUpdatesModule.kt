package expo.modules.liveupdates

import android.app.PendingIntent
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadata
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import expo.modules.kotlin.Promise
import expo.modules.kotlin.events.EventEmitter
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.URL

/**
 * 完整的 Android MediaSession 实现。
 *
 * - 元数据：title / artist / album / artwork / duration / trackId / queueIndex / queueLength
 * - PlaybackState：完整 actions + 实时 position + playbackSpeed
 * - Callback：onPlay / onPause / onSeekTo / onSkipToNext / onSkipToPrevious / onStop
 *   全部以 "mediaControl" 事件 emit 到 JS 侧
 * - 自驱动进度：每 500ms 在 STATE_PLAYING 时刷新 playbackState，避免锁屏进度条跳变
 * - SessionActivity：点击锁屏卡片 / 流体云胶囊回到 MainActivity
 */
class ExpoLiveUpdatesModule : Module() {
    private var mediaSession: MediaSession? = null
    private val handler = Handler(Looper.getMainLooper())
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    private var isPlaying = false
    private var positionMs: Long = 0L
    private var durationMs: Long = 0L
    private var playbackSpeed: Float = 1.0f
    private var lastTickAt: Long = 0L  // SystemClock.elapsedRealtime()

    private val progressTicker = object : Runnable {
        override fun run() {
            try {
                if (isPlaying && mediaSession != null) {
                    val now = SystemClock.elapsedRealtime()
                    if (lastTickAt > 0L) {
                        val deltaMs = (now - lastTickAt) * playbackSpeed
                        positionMs = (positionMs + deltaMs.toLong()).coerceAtLeast(0L)
                        if (durationMs > 0L) positionMs = positionMs.coerceAtMost(durationMs)
                    }
                    lastTickAt = now
                    pushPlaybackState()
                }
            } catch (_: Throwable) {
                // ticker 必须永不中断
            }
            handler.postDelayed(this, 500L)
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoLiveUpdates")

        Events("mediaControl")

        // 启动（或重建）一个 MediaSession，并立刻把元数据/状态推到系统。
        // 该方法是幂等的：若已存在 session 则先释放再创建。
        AsyncFunction("startSession") { promise: Promise ->
            try {
                val ctx = appContext.reactContext ?: throw Exception("No React context")
                releaseSession()

                mediaSession = MediaSession(ctx, "HyacineMusicSession").apply {
                    setFlags(
                        MediaSession.FLAG_HANDLES_MEDIA_BUTTONS or
                                MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS
                    )

                    // 点击锁屏卡片 / OPPO 流体云胶囊 → 回到 app
                    val openIntent = Intent(ctx, Class.forName("${ctx.packageName}.MainActivity"))
                        .apply {
                            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        }
                    val pi = PendingIntent.getActivity(
                        ctx,
                        0,
                        openIntent,
                        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                    )
                    setSessionActivity(pi)

                    // 控制回调 emit 到 JS
                    setCallback(object : MediaSession.Callback() {
                        override fun onPlay() {
                            emit("play", null)
                            isPlaying = true
                            lastTickAt = SystemClock.elapsedRealtime()
                            pushPlaybackState()
                        }

                        override fun onPause() {
                            emit("pause", null)
                            isPlaying = false
                            lastTickAt = 0L
                            pushPlaybackState()
                        }

                        override fun onStop() {
                            emit("stop", null)
                            isPlaying = false
                            lastTickAt = 0L
                            pushPlaybackState()
                        }

                        override fun onSkipToNext() {
                            emit("next", null)
                        }

                        override fun onSkipToPrevious() {
                            emit("prev", null)
                        }

                        override fun onSeekTo(pos: Long) {
                            positionMs = pos.coerceAtLeast(0L)
                            if (durationMs > 0L) positionMs = positionMs.coerceAtMost(durationMs)
                            lastTickAt = SystemClock.elapsedRealtime()
                            // JS 侧契约：position 单位为秒
                            emit("seek", mapOf("position" to (positionMs / 1000.0)))
                            pushPlaybackState()
                        }
                    })

                    isActive = true
                }

                // 启动自驱动 ticker
                handler.removeCallbacks(progressTicker)
                handler.post(progressTicker)

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "Failed to start session: ${e.message}", e)
            }
        }

        // 同步元数据：title / artist / album / artworkUrl / duration / trackId / queueIndex / queueLength
        AsyncFunction("updateMetadata") { data: Map<String, Any?>, promise: Promise ->
            try {
                val session = mediaSession ?: run {
                    promise.reject("ERR_NO_SESSION", "MediaSession not started")
                    return@AsyncFunction
                }

                val title = data["title"] as? String ?: ""
                val artist = data["artist"] as? String ?: ""
                val album = data["album"] as? String ?: ""
                val trackId = data["trackId"] as? String
                val artworkUrl = data["artworkUrl"] as? String
                val newDuration = (data["duration"] as? Number)?.toLong() ?: 0L
                val queueIndex = (data["queueIndex"] as? Number)?.toInt() ?: 0
                val queueLength = (data["queueLength"] as? Number)?.toInt() ?: 0

                durationMs = newDuration.coerceAtLeast(0L)

                val builder = MediaMetadata.Builder()
                    .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                    .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
                    .putString(MediaMetadata.METADATA_KEY_ALBUM, album)
                    .putLong(MediaMetadata.METADATA_KEY_DURATION, durationMs)

                if (!trackId.isNullOrEmpty()) {
                    builder.putString(MediaMetadata.METADATA_KEY_MEDIA_ID, trackId)
                }
                if (queueLength > 0) {
                    builder.putLong(MediaMetadata.METADATA_KEY_NUM_TRACKS, queueLength.toLong())
                    builder.putLong(MediaMetadata.METADATA_KEY_TRACK_NUMBER, queueIndex.toLong())
                }

                // 封面异步下载
                if (!artworkUrl.isNullOrEmpty()) {
                    scope.launch {
                        val bitmap = downloadBitmap(artworkUrl)
                        if (bitmap != null) {
                            builder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, bitmap)
                            builder.putBitmap(MediaMetadata.METADATA_KEY_DISPLAY_ICON, bitmap)
                            mediaSession?.setMetadata(builder.build())
                        } else {
                            mediaSession?.setMetadata(builder.build())
                        }
                    }
                } else {
                    session.setMetadata(builder.build())
                }

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "updateMetadata failed: ${e.message}", e)
            }
        }

        // 同步播放状态：isPlaying / position / duration / speed
        AsyncFunction("updatePlaybackState") { data: Map<String, Any?>, promise: Promise ->
            try {
                isPlaying = data["isPlaying"] as? Boolean ?: false
                positionMs = (data["position"] as? Number)?.toLong() ?: positionMs
                durationMs = (data["duration"] as? Number)?.toLong() ?: durationMs
                playbackSpeed = (data["speed"] as? Number)?.toFloat() ?: 1.0f
                lastTickAt = if (isPlaying) SystemClock.elapsedRealtime() else 0L
                pushPlaybackState()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "updatePlaybackState failed: ${e.message}", e)
            }
        }

        // 设置队列（用于锁屏显示"1/10"等）
        AsyncFunction("setQueue") { tracks: List<Map<String, Any?>>, currentIndex: Int, promise: Promise ->
            try {
                val session = mediaSession ?: run {
                    promise.resolve(null)
                    return@AsyncFunction
                }
                val queueItems = tracks.mapIndexed { index, item ->
                    val desc = android.media.MediaDescription.Builder()
                        .setTitle(item["title"] as? String ?: "")
                        .setSubtitle(item["artist"] as? String ?: "")
                        .setMediaId(item["id"] as? String ?: index.toString())
                        .build()
                    android.media.session.MediaSession.QueueItem(desc, index.toLong())
                }
                session.setQueue(queueItems)
                session.setQueueTitle("Hyacine Music")
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "setQueue failed: ${e.message}", e)
            }
        }

        // 单独设置封面（用于切歌后异步返回）
        AsyncFunction("setArtwork") { url: String, promise: Promise ->
            try {
                if (url.isEmpty()) {
                    promise.resolve(null)
                    return@AsyncFunction
                }
                scope.launch {
                    val bitmap = downloadBitmap(url)
                    if (bitmap != null && mediaSession != null) {
                        val current = mediaSession?.controller?.metadata
                        val builder = if (current != null) {
                            MediaMetadata.Builder(current)
                        } else {
                            MediaMetadata.Builder()
                        }
                        builder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, bitmap)
                        builder.putBitmap(MediaMetadata.METADATA_KEY_DISPLAY_ICON, bitmap)
                        mediaSession?.setMetadata(builder.build())
                    }
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "setArtwork failed: ${e.message}", e)
            }
        }

        // 显式销毁 session
        AsyncFunction("stopSession") { promise: Promise ->
            try {
                releaseSession()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERR_LIVE_UPDATES", "stopSession failed: ${e.message}", e)
            }
        }

        OnDestroy {
            releaseSession()
        }
    }

    private fun releaseSession() {
        handler.removeCallbacks(progressTicker)
        try {
            mediaSession?.let {
                it.isActive = false
                it.release()
            }
        } catch (_: Throwable) {
            // 忽略重复释放
        }
        mediaSession = null
    }

    private fun pushPlaybackState() {
        val session = mediaSession ?: return
        val state = if (isPlaying) PlaybackState.STATE_PLAYING else PlaybackState.STATE_PAUSED
        val pos = if (isPlaying) {
            // 由 ticker 推进；外部调用时使用传入值
            positionMs
        } else positionMs

        val pb = PlaybackState.Builder()
            .setActions(
                PlaybackState.ACTION_PLAY or
                        PlaybackState.ACTION_PAUSE or
                        PlaybackState.ACTION_PLAY_PAUSE or
                        PlaybackState.ACTION_SEEK_TO or
                        PlaybackState.ACTION_SKIP_TO_NEXT or
                        PlaybackState.ACTION_SKIP_TO_PREVIOUS or
                        PlaybackState.ACTION_STOP or
                        PlaybackState.ACTION_SET_RATING or
                        PlaybackState.ACTION_SKIP_TO_QUEUE_ITEM
            )
            .setState(state, pos, if (isPlaying) playbackSpeed else 0f)
            .setBufferedPosition(durationMs)
            .build()
        session.setPlaybackState(pb)
    }

    private fun emit(action: String, extra: Map<String, Any?>?) {
        val payload = mutableMapOf<String, Any?>("action" to action)
        if (extra != null) payload.putAll(extra)
        this@ExpoLiveUpdatesModule.emit("mediaControl", payload)
    }

    private suspend fun downloadBitmap(url: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // 兼容本地 file:// 路径与远程 http(s) URL
            val stream = if (url.startsWith("file://") || url.startsWith("content://")) {
                val ctx = appContext.reactContext ?: return@withContext null
                ctx.contentResolver.openInputStream(Uri.parse(url))
            } else {
                URL(url).openConnection().getInputStream()
            }
            stream?.use { BitmapFactory.decodeStream(it) }
        } catch (_: Throwable) {
            null
        }
    }
}
