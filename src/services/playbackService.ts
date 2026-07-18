import TrackPlayer, { Event, State } from "react-native-track-player";
import { appLog } from "@/utils/logger";

export default async function playbackService(): Promise<void> {
  appLog.info("playbackService", "service handler attached");

  const getStore = () => {
    // Lazy import avoids pulling zustand into the app entry path.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@/store/playerStore").usePlayerStore as typeof import("@/store/playerStore").usePlayerStore;
  };

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    appLog.info("playbackService", "remote play");
    void TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    appLog.info("playbackService", "remote pause");
    void TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    appLog.info("playbackService", "remote stop");
    void TrackPlayer.stop();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    appLog.info("playbackService", "remote seek", { position });
    void TrackPlayer.seekTo(position);
  });
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    appLog.info("playbackService", "playback state", { state });
    try {
      getStore().getState().setPlaying(state === State.Playing);
    } catch (error) {
      appLog.warn("playbackService", "store update failed on state", error);
    }
  });
  TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
    appLog.error("playbackService", "playback error", event);
    try {
      getStore().getState().setPlaying(false);
    } catch (error) {
      appLog.warn("playbackService", "store update failed on error", error);
    }
  });
}