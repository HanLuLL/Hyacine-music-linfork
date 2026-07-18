import TrackPlayer, { Event, State } from "react-native-track-player";
import { usePlayerStore } from "@/store/playerStore";

export default async function playbackService(): Promise<void> {
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
    usePlayerStore.getState().setPlaying(state === State.Playing);
  });
  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    usePlayerStore.getState().setPlaying(false);
  });
}
