import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  State,
} from "react-native-track-player";
import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import { registerPlaybackServiceOnce } from "@/services/registerPlaybackService";
import type { Track } from "@/types/music";
import { appLog, summarizeUrl } from "@/utils/logger";

let initialized = false;
let optionsApplied = false;

export async function initializePlayer(): Promise<void> {
  appLog.info("player", "initializePlayer start", {
    initialized,
    optionsApplied,
  });
  registerPlaybackServiceOnce();
  if (!initialized) {
    try {
      appLog.info("player", "TrackPlayer.setupPlayer");
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
        waitForBuffer: true,
      });
      appLog.info("player", "TrackPlayer.setupPlayer ok");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Already initialized by a previous session or hot reload.
      if (!/already been initialized|already initialized/i.test(message)) {
        appLog.error("player", "TrackPlayer.setupPlayer failed", error);
        throw error;
      }
      appLog.warn("player", "TrackPlayer already initialized", { message });
    }
    initialized = true;
  }

  if (!optionsApplied) {
    try {
      appLog.info("player", "TrackPlayer.updateOptions");
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
      appLog.info("player", "TrackPlayer.updateOptions ok");
    } catch (error) {
      appLog.error("player", "TrackPlayer.updateOptions failed", error);
      throw error;
    }
  }
}

export async function playTrack(track: Track): Promise<void> {
  appLog.info("player", "playTrack start", {
    id: track.id,
    title: track.title,
    artist: track.artist,
    url: summarizeUrl(track.url),
    artwork: summarizeUrl(track.artwork),
    hasHeaders: Boolean(track.headers && Object.keys(track.headers).length > 0),
  });
  if (!track.url) {
    appLog.error("player", "missing playable url", { id: track.id });
    throw new Error("未获取到可播放的音频地址");
  }
  await initializePlayer();
  try {
    appLog.info("player", "TrackPlayer.reset");
    await TrackPlayer.reset();
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
    appLog.info("player", "TrackPlayer.add", {
      id: payload.id,
      url: summarizeUrl(payload.url),
      hasArtwork: Boolean(payload.artwork),
      hasHeaders: Boolean(payload.headers),
    });
    await TrackPlayer.add(payload);
    appLog.info("player", "TrackPlayer.play");
    await TrackPlayer.play();
    appLog.info("player", "playTrack ok", { id: track.id });
  } catch (error) {
    appLog.error("player", "playTrack failed", error);
    usePlayerStore.getState().setPlaying(false);
    usePlayerStore.getState().setCurrentTrack(null);
    throw error instanceof Error ? error : new Error("原生播放器无法播放此音频");
  }
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaying(true);
  void recordListeningHistory(track).catch((error) => {
    appLog.warn("player", "recordListeningHistory failed", error);
  });
}

export async function togglePlayback(): Promise<void> {
  await initializePlayer();
  const state = await TrackPlayer.getPlaybackState();
  appLog.info("player", "togglePlayback", { state: state.state });
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
  appLog.info("player", "seekBy", { seconds });
  await TrackPlayer.seekBy(seconds);
}