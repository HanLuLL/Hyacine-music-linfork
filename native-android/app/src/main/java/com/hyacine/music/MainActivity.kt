package com.hyacine.music

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

private const val PREFS = "hyacine_native"
private const val KEY_BACKEND = "backend"
private const val KEY_COOKIE = "netease_cookie"

data class Track(val id: String, val title: String, val artist: String, val artwork: String = "", val durationMs: Long = 0)

class MainActivity : ComponentActivity() {
  private lateinit var player: ExoPlayer

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    player = ExoPlayer.Builder(this).build()
    setContent { HyacineApp(this, player) }
  }

  override fun onDestroy() {
    player.release()
    super.onDestroy()
  }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun HyacineApp(context: Context, player: ExoPlayer) {
  val prefs = remember { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
  var backend by remember { mutableStateOf(prefs.getString(KEY_BACKEND, "") ?: "") }
  var cookie by remember { mutableStateOf(prefs.getString(KEY_COOKIE, "") ?: "") }
  var configured by remember { mutableStateOf(backend.isNotBlank()) }
  var currentTrack by remember { mutableStateOf<Track?>(null) }
  var playing by remember { mutableStateOf(false) }

  MaterialTheme {
    Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFFF8FAFC)) {
      if (!configured) {
        SetupScreen(backend, cookie, onBackend = { backend = it }, onCookie = { cookie = it }) {
          backend = normalizeBackend(backend)
          prefs.edit().putString(KEY_BACKEND, backend).putString(KEY_COOKIE, cookie).apply()
          configured = backend.isNotBlank()
        }
      } else {
        val pager = rememberPagerState(pageCount = { 4 })
        val scope = rememberCoroutineScope()
        Column(Modifier.fillMaxSize()) {
          HorizontalPager(state = pager, modifier = Modifier.weight(1f)) { page ->
            AnimatedContent(targetState = page, transitionSpec = { fadeIn(tween(180)) togetherWith fadeOut(tween(120)) }, label = "page") {
              when (page) {
                0 -> HomePage(backend, cookie, onPlay = { track ->
                  val url = resolvePlayUrl(backend, cookie, track.id)
                  if (url.isNotBlank()) {
                    player.setMediaItem(MediaItem.fromUri(url)); player.prepare(); player.play()
                    currentTrack = track; playing = true
                  }
                })
                1 -> PlaceholderPage("搜索", "搜索接口将在此页接入")
                2 -> PlaceholderPage("歌单库", "网易云歌单将在此页显示")
                else -> ProfilePage(backend, onBackend = { backend = it }, onSave = {
                  backend = normalizeBackend(backend)
                  prefs.edit().putString(KEY_BACKEND, backend).apply()
                })
              }
            }
          }
          currentTrack?.let { track -> MiniPlayer(track, playing, onToggle = {
            if (player.isPlaying) { player.pause(); playing = false } else { player.play(); playing = true }
          }) }
          NavigationBar {
            listOf("首页", "搜索", "歌单", "我的").forEachIndexed { index, label ->
              NavigationBarItem(selected = pager.currentPage == index, onClick = { scope.launch { pager.animateScrollToPage(index) } }, icon = { Text(if (index == 0) "⌂" else if (index == 1) "⌕" else if (index == 2) "♫" else "◉") }, label = { Text(label) })
            }
          }
        }
      }
    }
  }
}

@Composable
private fun SetupScreen(backend: String, cookie: String, onBackend: (String) -> Unit, onCookie: (String) -> Unit, onSave: () -> Unit) {
  Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
    Text("风堇音乐", fontSize = 32.sp, fontWeight = FontWeight.Bold)
    Text("原生 Kotlin 版本", color = Color.Gray)
    Spacer(Modifier.height(28.dp))
    OutlinedTextField(value = backend, onValueChange = onBackend, modifier = Modifier.fillMaxWidth(), label = { Text("后端地址") }, placeholder = { Text("http://103.236.75.20:3000/api/v1") })
    Spacer(Modifier.height(12.dp))
    OutlinedTextField(value = cookie, onValueChange = onCookie, modifier = Modifier.fillMaxWidth(), label = { Text("网易云 Cookie") }, minLines = 3)
    Spacer(Modifier.height(20.dp))
    Button(onClick = onSave, modifier = Modifier.fillMaxWidth()) { Text("进入音乐库") }
  }
}

@Composable
private fun HomePage(backend: String, cookie: String, onPlay: suspend (Track) -> Unit) {
  var tracks by remember { mutableStateOf<List<Track>>(emptyList()) }
  var loading by remember { mutableStateOf(true) }
  var error by remember { mutableStateOf("") }
  LaunchedEffect(backend, cookie) {
    loading = true
    runCatching { fetchDailyTracks(backend, cookie) }.onSuccess { tracks = it }.onFailure { error = it.message ?: "加载失败" }
    loading = false
  }
  Column(Modifier.fillMaxSize().padding(20.dp)) {
    Text("每日推荐", fontSize = 28.sp, fontWeight = FontWeight.Bold)
    Text("网易云音乐", color = Color(0xFF64748B))
    Spacer(Modifier.height(18.dp))
    if (loading) Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
    if (error.isNotBlank()) Text(error, color = Color(0xFFDC2626))
    tracks.forEach { track ->
      Card(Modifier.fillMaxWidth().padding(vertical = 5.dp).clickable { kotlinx.coroutines.GlobalScope.launch(Dispatchers.Main) { onPlay(track) } }, shape = RoundedCornerShape(12.dp)) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
          Text("♪", fontSize = 24.sp, color = Color(0xFF2563EB))
          Spacer(Modifier.width(12.dp))
          Column(Modifier.weight(1f)) { Text(track.title, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis); Text(track.artist, color = Color.Gray, maxLines = 1, overflow = TextOverflow.Ellipsis) }
          Text("播放", color = Color(0xFF2563EB))
        }
      }
    }
  }
}

@Composable private fun PlaceholderPage(title: String, body: String) { Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Column(horizontalAlignment = Alignment.CenterHorizontally) { Text(title, fontSize = 28.sp, fontWeight = FontWeight.Bold); Spacer(Modifier.height(8.dp)); Text(body, color = Color.Gray) } } }
@Composable private fun ProfilePage(backend: String, onBackend: (String) -> Unit, onSave: () -> Unit) { Column(Modifier.fillMaxSize().padding(24.dp)) { Text("我的", fontSize = 28.sp, fontWeight = FontWeight.Bold); Spacer(Modifier.height(20.dp)); OutlinedTextField(backend, onBackend, Modifier.fillMaxWidth(), label = { Text("后端地址") }); Spacer(Modifier.height(12.dp)); Button(onClick = onSave) { Text("保存") } } }
@Composable private fun MiniPlayer(track: Track, playing: Boolean, onToggle: () -> Unit) { Card(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp), shape = RoundedCornerShape(14.dp)) { Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) { Text("♪", fontSize = 22.sp); Spacer(Modifier.width(10.dp)); Text(track.title, Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis); Text(if (playing) "暂停" else "播放", Modifier.clickable(onClick = onToggle), color = Color(0xFF2563EB)) } } }

private fun normalizeBackend(raw: String): String { val value = raw.trim().trimEnd('/'); return if (value.endsWith("/api/v1")) value else "$value/api/v1" }
private val client = OkHttpClient.Builder().connectTimeout(12, TimeUnit.SECONDS).readTimeout(20, TimeUnit.SECONDS).build()
private suspend fun fetchDailyTracks(backend: String, cookie: String): List<Track> = withContext(Dispatchers.IO) {
  val body = JSONObject().put("cookie", cookie).toString().toRequestBody("application/json".toMediaType())
  val request = Request.Builder().url("${normalizeBackend(backend)}/music-sources/netease/daily-songs").post(body).build()
  client.newCall(request).execute().use { response -> if (!response.isSuccessful) error("每日推荐请求失败: ${response.code}"); val array = JSONArray(response.body.string()); List(array.length()) { i -> val item = array.getJSONObject(i); Track("netease:${item.getLong("id")}", item.optString("title"), item.optJSONArray("artists")?.let { a -> List(a.length()) { a.getString(it) }.joinToString(" / ") } ?: "网易云音乐", item.optString("coverUrl"), item.optLong("durationMs")) } }
}
private suspend fun resolvePlayUrl(backend: String, cookie: String, id: String): String = withContext(Dispatchers.IO) {
  val numericId = id.substringAfter(':'); val body = JSONObject().put("id", numericId).put("cookie", cookie).toString().toRequestBody("application/json".toMediaType()); val request = Request.Builder().url("${normalizeBackend(backend)}/music-sources/netease/play-url").post(body).build(); client.newCall(request).execute().use { response -> if (!response.isSuccessful) return@withContext ""; JSONObject(response.body.string()).optString("url") }
}
