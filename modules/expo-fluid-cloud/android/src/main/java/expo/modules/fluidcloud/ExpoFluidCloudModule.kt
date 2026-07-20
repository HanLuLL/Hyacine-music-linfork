package expo.modules.fluidcloud

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream
import java.net.URL

private const val FLUID_CLOUD_AUTHORITY = "com.oppo.fluidCloud.provider"
private const val SHARE_INTENT_URI = "content://$FLUID_CLOUD_AUTHORITY/shareintent"
private const val DELETE_INTENT_URI = "content://$FLUID_CLOUD_AUTHORITY/deleteintent"
private const val QUERY_FEATURE_URI = "content://$FLUID_CLOUD_AUTHORITY/queryfeature"

class ExpoFluidCloudModule : Module() {
  private var templateId: String? = null
  private var lastProgress = 0L
  private var lastDuration = 0L

  override fun definition() = ModuleDefinition {
    Name("ExpoFluidCloud")

    AsyncFunction("isAvailable") { promise: Promise ->
      try {
        val ctx = appContext.reactActivity ?: throw Exception("No activity")
        val cursor = ctx.contentResolver.query(
          Uri.parse(QUERY_FEATURE_URI),
          null, "music_playback", null, null
        )
        val available = cursor != null && cursor.count > 0
        cursor?.close()
        promise.resolve(available)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }

    AsyncFunction("updateNowPlaying") { data: Map<String, Any?>, promise: Promise ->
      try {
        val ctx = appContext.reactActivity ?: throw Exception("No activity")
        val values = ContentValues()

        // Template type: music_playback (progress)
        values.put("templateType", "music_playback")
        values.put("templateId", templateId ?: "hyacine_music_${System.currentTimeMillis()}")
        templateId = values.getAsString("templateId")

        values.put("title", data["title"] as? String ?: "")
        values.put("artist", data["artist"] as? String ?: "")
        values.put("album", data["album"] as? String ?: "")

        val progress = (data["progress"] as? Number)?.toLong() ?: 0L
        val duration = (data["duration"] as? Number)?.toLong() ?: 0L
        values.put("progress", progress)
        values.put("duration", duration)
        lastProgress = progress
        lastDuration = duration

        val isPlaying = data["isPlaying"] as? Boolean ?: false
        values.put("playState", if (isPlaying) "playing" else "paused")
        values.put("isPlaying", if (isPlaying) 1 else 0)

        // Cover image as base64
        data["coverUrl"]?.let { cover ->
          if (cover is String && cover.isNotEmpty()) {
            try {
              val bitmap = BitmapFactory.decodeStream(URL(cover).openConnection().getInputStream())
              if (bitmap != null) {
                val stream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 80, stream)
                val base64Cover = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
                values.put("cover", base64Cover)
                bitmap.recycle()
              }
            } catch (_: Exception) {
              // Cover download failed silently
            }
          }
        }

        // Lyrics (optional)
        data["lyrics"]?.let { lyrics ->
          if (lyrics is String && lyrics.isNotEmpty()) {
            values.put("lyrics", lyrics)
          }
        }

        // Actions: play/pause/next/prev
        values.put("supportPlayPause", 1)
        values.put("supportNext", 1)
        values.put("supportPrev", 1)
        values.put("supportSeek", 1)

        ctx.contentResolver.insert(Uri.parse(SHARE_INTENT_URI), values)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(CodedException("ERR_FLUID_CLOUD", e.message, e))
      }
    }

    AsyncFunction("removeNowPlaying") { promise: Promise ->
      try {
        templateId?.let { id ->
          val ctx = appContext.reactActivity ?: throw Exception("No activity")
          ctx.contentResolver.delete(Uri.parse(DELETE_INTENT_URI), "templateId = ?", arrayOf(id))
          templateId = null
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(CodedException("ERR_FLUID_CLOUD_REMOVE", e.message, e))
      }
    }
  }
}