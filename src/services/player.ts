import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import type { Track } from "@/types/music";
import { appLog } from "@/utils/logger";

/**
 * Startup-safe player facade.
 *
 * expo-av 16 loads libexpo-av during Expo module registration. The installed
 * APK pairs that library with an incompatible React Native JSI ABI and crashes
 * before JavaScript starts. Keep state and queue interactions available while
 * the playback backend is replaced with an SDK-compatible implementation.
 */
export async function playTrack(track: Track): Promise<void> {
  if (!track.url) throw new Error("未获取到可播放的音频地址");
  appLog.warn("player", "playback backend unavailable in this build", { id: track.id });
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaying(false);
  await recordListeningHistory(track).catch((error) => appLog.warn("player", "record history failed", error));
}

export async function togglePlayback(): Promise<void> {
  const state = usePlayerStore.getState();
  if (!state.currentTrack) return;
  state.setPlaying(false);
  throw new Error("播放组件正在维护，暂不可用");
}

export async function seekBy(_seconds: number): Promise<void> {
  usePlayerStore.getState().setPlaying(false);
}