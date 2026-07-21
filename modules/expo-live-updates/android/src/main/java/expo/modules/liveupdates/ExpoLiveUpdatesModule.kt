package expo.modules.liveupdates

import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.media.MediaMetadata
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.net.URL

class ExpoLiveUpdatesModule : Module() {
  private var mediaSession: MediaSession? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoLiveUpdates")

    Function("startSession") { title: String, artist: String, artworkUrl: String?, promise: Promise ->
      try {
        val context = appContext.reactContext ?: throw Exception("No React context")
        
        if (mediaSession != null) {
          mediaSession?.release()
        }
        
        mediaSession = MediaSession(context, "HyacineMusicSession").apply {
          setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS or MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS)
          isActive = true
          
          val metadata = MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
          
          artworkUrl?.let { url ->
            try {
              val bitmap = BitmapFactory.decodeStream(URL(url).openStream())
              metadata.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, bitmap)
            } catch (e: Exception) {
              // Artwork download failed, continue without it
            }
          }
          
          setMetadata(metadata.build())
        }
        
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("ERR_LIVE_UPDATES", "Failed to start session", e)
      }
    }

    Function("updatePlaybackState") { isPlaying: Boolean, position: Long, duration: Long, promise: Promise ->
      try {
        val state = if (isPlaying) PlaybackState.STATE_PLAYING else PlaybackState.STATE_PAUSED
        val playbackState = PlaybackState.Builder()
          .setActions(
            PlaybackState.ACTION_PLAY or
            PlaybackState.ACTION_PAUSE or
            PlaybackState.ACTION_PLAY_PAUSE or
            PlaybackState.ACTION_SEEK_TO or
            PlaybackState.ACTION_SKIP_TO_NEXT or
            PlaybackState.ACTION_SKIP_TO_PREVIOUS
          )
          .setState(state, position, 1.0f)
          .build()
        
        mediaSession?.setPlaybackState(playbackState)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("ERR_LIVE_UPDATES", "Failed to update playback state", e)
      }
    }

    Function("stopSession") { promise: Promise ->
      try {
        mediaSession?.let {
          it.isActive = false
          it.release()
        }
        mediaSession = null
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("ERR_LIVE_UPDATES", "Failed to stop session", e)
      }
    }

    OnDestroy {
      mediaSession?.let {
        it.isActive = false
        it.release()
      }
      mediaSession = null
    }
  }
}
