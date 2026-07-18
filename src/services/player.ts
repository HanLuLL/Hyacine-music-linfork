import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  State,
} from "react-native-track-player";
import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import { registerPlaybackServiceOnce } from "@/services/registerPlaybackService";
import type { Track } from "@/types/music";

let initialized = false;
let optionsApplied = false;

export async function initializePlayer(): Promise<void> {
  registerPlaybackServiceOnce();
  if (!initialized) {
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
        waitForBuffer: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Already initialized by a previous session or hot reload.
      if (!/already been initialized|already initialized/i.test(message)) {
        throw error;
      }
    }
    initialized = true;
  }

  if (!optionsApplied) {
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      color: 0xd7f56a,
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        alwaysPauseOnInterruption: true,
        stopForegroundGracePeriod: 5,
      },
      progressUpdateEventInterval: 1,
    });
    optionsApplied = true;
  }
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
    usePlayerStore.getState().setCurrentTrack(null);
    throw error instanceof Error ? error : new Error("原生播放器无法播放此音频");
  }
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaying(true);
  void recordListeningHistory(track).catch(() => undefined);
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
