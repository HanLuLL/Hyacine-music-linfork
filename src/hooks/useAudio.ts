import { useCallback } from "react";
import type { Track } from "@/types/music";

interface UseAudioResult {
  playTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
}

/**
 * Keep the native Track Player module out of the initial render path.
 * It is loaded only after the user explicitly starts or toggles playback.
 */
export function useAudio(): UseAudioResult {
  const playTrack = useCallback(async (track: Track) => {
    const player = await import("@/services/player");
    await player.playTrack(track);
  }, []);

  const togglePlayback = useCallback(async () => {
    const player = await import("@/services/player");
    await player.togglePlayback();
  }, []);

  return { playTrack, togglePlayback };
}