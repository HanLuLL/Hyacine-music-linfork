import TrackPlayer, { Event, State } from "react-native-track-player";

export default async function playbackService(): Promise<void> {
  const getStore = () => {
    // Lazy import avoids pulling zustand into the app entry path.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@/store/playerStore").usePlayerStore as typeof import("@/store/playerStore").usePlayerStore;
  };

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    void TrackPlayer.stop();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
    void TrackPlayer.seekTo(position);
  });
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    try {
      getStore().getState().setPlaying(state === State.Playing);
    } catch {
      // ignore store failures in headless context
    }
  });
  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    try {
      getStore().getState().setPlaying(false);
    } catch {
      // ignore store failures in headless context
    }
  });
}
