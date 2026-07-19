import { useCallback } from "react";
import type { Track } from "@/types/music";
import { appLog, summarizeUrl } from "@/utils/logger";
import { useAccount } from "@/account";
import { resolvePlayableTrack } from "@/services/musicApi";
import { useAudioPreferences } from "@/audioPreferences";

type PlayerModule = typeof import("@/services/player");

function loadPlayer(): Promise<PlayerModule> {
  return import("@/services/player");
}

interface UseAudioResult {
  playTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekBy: (seconds: number) => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

export function useAudio(): UseAudioResult {
  const { profile, getSourceCredential } = useAccount();
  const { quality } = useAudioPreferences();
  const playTrack = useCallback(async (track: Track) => {
    appLog.info("audio", "playTrack called", {
      trackId: track.id,
      title: track.title,
      url: summarizeUrl(track.url),
    });
    try {
      let playable = track;
      if (profile?.backendUrl && (track.id.startsWith("netease:") || track.id.startsWith("bilibili:"))) {
        const source = track.id.startsWith("netease:") ? "netease" : "bilibili";
        const cookie = await getSourceCredential(source);
        playable = await resolvePlayableTrack({ backendUrl: profile.backendUrl, track, cookie, quality });
      }
      await (await loadPlayer()).playTrack(playable);
    } catch (error) {
      appLog.error("audio", "playTrack failed", error);
      throw error;
    }
  }, [getSourceCredential, profile?.backendUrl, quality]);
  const togglePlayback = useCallback(async () => {
    appLog.info("audio", "togglePlayback");
    try {
      await (await loadPlayer()).togglePlayback();
    } catch (error) {
      appLog.error("audio", "togglePlayback failed", error);
      throw error;
    }
  }, []);

  const seekBy = useCallback(async (seconds: number) => {
    appLog.info("audio", "seekBy", { seconds });
    try {
      await (await loadPlayer()).seekBy(seconds);
    } catch (error) {
      appLog.error("audio", "seekBy failed", error);
      throw error;
    }
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    appLog.info("audio", "seekTo", { seconds });
    await (await loadPlayer()).seekTo(seconds);
  }, []);
  return { playTrack, togglePlayback, seekBy, seekTo };
}