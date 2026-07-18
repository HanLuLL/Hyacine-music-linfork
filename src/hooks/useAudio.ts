import { useCallback } from "react";
import type { Track } from "@/types/music";
import { appLog, summarizeUrl } from "@/utils/logger";

interface UseAudioResult {
  playTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekBy: (seconds: number) => Promise<void>;
}

/**
 * Keep the native Track Player module out of the initial render path.
 * It is loaded only after the user explicitly starts or toggles playback.
 */
export function useAudio(): UseAudioResult {
  const playTrack = useCallback(async (track: Track) => {
    appLog.info("audio", "dynamic import player module", {
      trackId: track.id,
      title: track.title,
      url: summarizeUrl(track.url),
    });
    try {
      const player = await import("@/services/player");
      appLog.info("audio", "player module loaded");
      await player.playTrack(track);
    } catch (error) {
      appLog.error("audio", "playTrack failed", error);
      throw error;
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    appLog.info("audio", "togglePlayback");
    try {
      const player = await import("@/services/player");
      await player.togglePlayback();
    } catch (error) {
      appLog.error("audio", "togglePlayback failed", error);
      throw error;
    }
  }, []);

  const seekBy = useCallback(async (seconds: number) => {
    appLog.info("audio", "seekBy", { seconds });
    try {
      const player = await import("@/services/player");
      await player.seekBy(seconds);
    } catch (error) {
      appLog.error("audio", "seekBy failed", error);
      throw error;
    }
  }, []);

  return { playTrack, togglePlayback, seekBy };
}