import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  State,
} from "react-native-track-player";
import { usePlayerStore } from "@/store/playerStore";
import playbackService from "@/services/playbackService";
import { recordListeningHistory } from "@/services/listeningHistory";
import type { Track } from "@/types/music";

let initialized = false;
let serviceRegistered = false;

function registerPlaybackService(): void {
  if (serviceRegistered) return;
  TrackPlayer.registerPlaybackService(() => playbackService);
  serviceRegistered = true;
}

export async function initializePlayer(): Promise<void> {
  if (initialized) return;

  registerPlaybackService();
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Already initialized by a previous session or hot reload.
    if (!/already been initialized|already initialized/i.test(message)) {
      throw error;
    }
  }
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
  });
  initialized = true;
}

export async function playTrack(track: Track): Promise<void> {
  if (!track.url) throw new Error("未获取到可播放的音频地址");
  await initializePlayer();
  await TrackPlayer.reset();
  try {
    const payload: {
      id: string;
      url: string;
      title: string;
      artist: string;
      artwork?: string;
      headers?: Record<string, string>;
    } = {
      id: track.id,
      url: track.url,
      title: track.title || "未知歌曲",
      artist: track.artist || "未知艺术家",
    };
    if (track.artwork && /^https?:\/\//i.test(track.artwork)) {
      payload.artwork = track.artwork;
    }
    if (track.headers && Object.keys(track.headers).length > 0) {
      payload.headers = track.headers;
    }
    await TrackPlayer.add(payload);
    await TrackPlayer.play();
  } catch (error) {
    usePlayerStore.getState().setPlaying(false);
    throw error instanceof Error ? error : new Error("原生播放器无法播放此音频");
  }
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaying(true);
  void recordListeningHistory(track);
}

export async function togglePlayback(): Promise<void> {
  await initializePlayer();
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
    usePlayerStore.getState().setPlaying(false);
    return;
  }

  await TrackPlayer.play();
  usePlayerStore.getState().setPlaying(true);
}

export async function seekBy(seconds: number): Promise<void> {
  await initializePlayer();
  await TrackPlayer.seekBy(seconds);
}