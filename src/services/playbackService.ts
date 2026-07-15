import TrackPlayer, { Event, State } from "react-native-track-player";
import { usePlayerStore } from "@/store/playerStore";

export default async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    usePlayerStore.getState().setPlaying(state === State.Playing);
  });
}