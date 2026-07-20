import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { usePlayerStore } from "@/store/playerStore";
import { recordListeningHistory } from "@/services/listeningHistory";
import type { Track } from "@/types/music";
import { appLog } from "@/utils/logger";
let player: AudioPlayer | null = null;
let modeReady = false;
let playbackCompletionHandler: (() => void) | null = null;
let trackResolver: ((track: Track) => Promise<Track>) | null = null;

export function setPlaybackCompletionHandler(handler: (() => void) | null): void {
  playbackCompletionHandler = handler;
}
export function setTrackResolver(resolver: ((track: Track) => Promise<Track>) | null): void {
  trackResolver = resolver;
}

async function ensureAudioMode(): Promise<void> {
  if (modeReady) return;
  await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix", shouldPlayInBackground: true });
  modeReady = true;
}

let nextPlayerId = 0;

function bindStatus(active: AudioPlayer): void {
  const playerId = ++nextPlayerId;
  let lastTime = 0;
  let lastDuration = 0;
  let completed = false;
  active.addListener("playbackStatusUpdate", (status) => {
    if (playerId !== nextPlayerId) return;
    const nowPlaying = status.playing ?? false;
    const nowTime = status.currentTime ?? 0;
    const nowDuration = status.duration ?? 0;
    usePlayerStore.getState().setPlaying(nowPlaying);
    usePlayerStore.getState().setProgress(nowTime, nowDuration);
    if (completed) return;
    const endedNatural = Boolean((status as { didJustFinish?: boolean }).didJustFinish)
      || (nowDuration > 0 && nowTime >= nowDuration - 0.5);
    lastTime = nowTime;
    lastDuration = nowDuration;
    if (!endedNatural) return;
    completed = true;
    playbackCompletionHandler?.();
    if (!playbackCompletionHandler) {
      const { queue, queueIndex, playMode, setQueue, currentTrack, pendingQueue, appendPendingToQueue } = usePlayerStore.getState();
      if (queue.length > 0 && queue.length - Math.max(queueIndex, 0) <= 3 && pendingQueue.length > 0) {
        appendPendingToQueue(5);
      }
      const refreshed = usePlayerStore.getState().queue;
      const playResolved = (track: Track, id: string) => {
        setQueue(refreshed, id);
        void (trackResolver ? trackResolver(track) : Promise.resolve(track))
          .then((resolved) => playTrack(resolved))
          .catch((error) => appLog.error("player", "auto next failed", { error, id }));
      };
      if (queue.length === 1) {
        if (playMode === "loop" && currentTrack) {
          playResolved(currentTrack, currentTrack.id);
        }
        return;
      }
      if (queueIndex < 0) return;
      const nextIndex = playMode === "shuffle"
        ? (() => { let index = queueIndex; while (index === queueIndex) index = Math.floor(Math.random() * queue.length); return index; })()
        : (queueIndex + 1) % queue.length;
      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        playResolved(nextTrack, nextTrack.id);
      } else if (playMode === "loop") {
        playResolved(queue[0], queue[0].id);
      }
    }
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