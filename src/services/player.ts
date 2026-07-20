import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import type { Track } from "@/types/music";
import { appLog } from "@/utils/logger";

let player: AudioPlayer | null = null;
let modeReady = false;
let playbackCompletionHandler: (() => void) | null = null;

export function setPlaybackCompletionHandler(handler: (() => void) | null): void {
  playbackCompletionHandler = handler;
}

async function ensureAudioMode(): Promise<void> {
  if (modeReady) return;
  await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix", shouldPlayInBackground: true });
  modeReady = true;
}

let nextPlayerId = 0;

function bindStatus(active: AudioPlayer): void {
  const playerId = ++nextPlayerId;
  let wasPlaying = false;
  let completed = false;
  active.addListener("playbackStatusUpdate", (status) => {
    if (playerId !== nextPlayerId) return;
    const nowPlaying = status.playing ?? false;
    const nowTime = status.currentTime ?? 0;
    const nowDuration = status.duration ?? 0;
    usePlayerStore.getState().setPlaying(nowPlaying);
    usePlayerStore.getState().setProgress(nowTime, nowDuration);
    if (wasPlaying && !nowPlaying && !completed) {
      const nearEnd = nowDuration > 0 && nowTime >= nowDuration - 0.5;
      const hasPlayed = nowTime > 3;
      if (nearEnd || hasPlayed) {
        completed = true;
        playbackCompletionHandler?.();
        if (!playbackCompletionHandler) {
          const { queue, queueIndex, playMode, setQueue, currentTrack } = usePlayerStore.getState();
          if (queue.length === 1) {
            if (playMode === "loop" && currentTrack) {
              void playTrack(currentTrack);
            }
            return;
          }
          if (queueIndex < 0) return;
          const nextIndex = playMode === "shuffle"
            ? (() => { let index = queueIndex; while (index === queueIndex) index = Math.floor(Math.random() * queue.length); return index; })()
            : (queueIndex + 1) % queue.length;
          const nextTrack = queue[nextIndex];
          if (nextTrack) {
            setQueue(queue, nextTrack.id);
            void playTrack(nextTrack);
          } else if (playMode === "loop") {
            void playTrack(queue[0]);
          }
        }
      }
    }
    wasPlaying = nowPlaying;
  });
}

export async function playTrack(track: Track): Promise<void> {
  if (!track.url) throw new Error("未获取到可播放的音频地址");
  await ensureAudioMode();
  try {
    player?.pause();
    player = createAudioPlayer(track.url);
    bindStatus(player);
    usePlayerStore.getState().setCurrentTrack(track);
    usePlayerStore.getState().setProgress(0, 0);
    player.play();
    player.setActiveForLockScreen(true, { title: track.title, artist: track.artist, artworkUrl: track.artwork });
    await recordListeningHistory(track);
  } catch (error) {
    usePlayerStore.getState().setPlaying(false);
    appLog.error("player", "expo-audio playback failed", error);
    throw error instanceof Error ? error : new Error("无法播放此音频");
  }
}

export async function togglePlayback(): Promise<void> {
  if (!player) return;
  if (player.playing) player.pause(); else player.play();
}

export async function seekBy(seconds: number): Promise<void> {
  if (!player) return;
  await player.seekTo(Math.max(0, player.currentTime + seconds));
}

export async function seekTo(seconds: number): Promise<void> {
  if (!player) return;
  await player.seekTo(Math.max(0, seconds));
}