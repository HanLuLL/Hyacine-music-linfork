import { Audio, type AVPlaybackStatus } from "expo-av";
import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import type { Track } from "@/types/music";
import { appLog, summarizeUrl } from "@/utils/logger";

let soundRef: Audio.Sound | null = null;
let audioModeSet = false;

async function ensureAudioMode(): Promise<void> {
  if (audioModeSet) return;
  audioModeSet = true;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: 1, // DoNotMix
      playsInSilentModeIOS: true,
      interruptionModeAndroid: 1, // DoNotMix
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    appLog.info("player", "Audio.setAudioModeAsync ok");
  } catch (error) {
    appLog.error("player", "Audio.setAudioModeAsync failed", error);
  }
}

async function unloadCurrent(): Promise<void> {
  if (!soundRef) return;
  try {
    await soundRef.unloadAsync();
  } catch {
    // ignore
  }
  soundRef = null;
}

export async function playTrack(track: Track): Promise<void> {
  appLog.info("player", "playTrack start", {
    id: track.id,
    title: track.title,
    url: summarizeUrl(track.url),
    artwork: summarizeUrl(track.artwork),
  });

  if (!track.url) {
    appLog.error("player", "missing playable url", { id: track.id });
    throw new Error("未获取到可播放的音频地址");
  }

  await ensureAudioMode();
  await unloadCurrent();

  try {
    appLog.info("player", "Audio.Sound.createAsync");
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true },
      onPlaybackStatusUpdate,
    );
    soundRef = sound;
    appLog.info("player", "playTrack ok", { id: track.id });
  } catch (error) {
    appLog.error("player", "playTrack failed", error);
    usePlayerStore.getState().setPlaying(false);
    usePlayerStore.getState().setCurrentTrack(null);
    throw error instanceof Error ? error : new Error("无法播放此音频");
  }

  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaying(true);
  void recordListeningHistory(track).catch((e) => {
    appLog.warn("player", "recordListeningHistory failed", e);
  });
}

function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (!status.isLoaded) {
    if (status.error) {
      appLog.error("player", "playback error", { error: status.error });
      usePlayerStore.getState().setPlaying(false);
    }
    return;
  }
  usePlayerStore.getState().setPlaying(status.isPlaying);
  if (status.durationMillis && status.durationMillis > 0) {
    usePlayerStore.getState().setProgress(
      status.positionMillis / 1000,
      status.durationMillis / 1000,
    );
  }
  if (status.didJustFinish) {
    usePlayerStore.getState().setPlaying(false);
  }
}

export async function togglePlayback(): Promise<void> {
  if (!soundRef) return;
  const status = await soundRef.getStatusAsync();
  if (!status.isLoaded) return;
  if (status.isPlaying) {
    await soundRef.pauseAsync();
    usePlayerStore.getState().setPlaying(false);
  } else {
    await soundRef.playAsync();
    usePlayerStore.getState().setPlaying(true);
  }
}

export async function seekBy(seconds: number): Promise<void> {
  if (!soundRef) return;
  const status = await soundRef.getStatusAsync();
  if (!status.isLoaded || !status.durationMillis) return;
  const target = Math.max(0, Math.min(status.durationMillis, status.positionMillis + seconds * 1000));
  await soundRef.setPositionAsync(target);
}