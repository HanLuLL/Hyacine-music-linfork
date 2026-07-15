import { useEffect } from "react";
import { useProgress } from "react-native-track-player";
import { initializePlayer, playTrack, togglePlayback } from "@/services/player";
import { usePlayerStore } from "@/store/playerStore";
import type { Track } from "@/types/music";

interface UseAudioResult {
  playTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
}

export function useAudio(): UseAudioResult {
  const { position, duration } = useProgress(250);
  const setProgress = usePlayerStore((state) => state.setProgress);

  useEffect(() => {
    void initializePlayer();
  }, []);

  useEffect(() => {
    setProgress(position, duration);
  }, [duration, position, setProgress]);

  return { playTrack, togglePlayback };
}