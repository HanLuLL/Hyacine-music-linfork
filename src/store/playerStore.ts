import { create } from "zustand";
import type { Track } from "@/types/music";

const INITIAL_QUEUE_LIMIT = 100;
const PLAYED_KEEP_BEHIND = 10;

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  pendingQueue: Track[];
  shuffleEnabled: boolean;
  repeatMode: "none" | "one" | "all";
  playMode: "sequential" | "loop" | "shuffle";
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[], currentTrackId?: string) => void;
  setPendingQueue: (tracks: Track[]) => void;
  appendPendingToQueue: (count: number) => void;
  trimPlayedBehind: (keep?: number) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setShuffleEnabled: (enabled: boolean) => void;
  cycleRepeatMode: () => void;
  cyclePlayMode: () => void;
  cycleUnifiedMode: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number, duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,
  pendingQueue: [],
  shuffleEnabled: false,
  repeatMode: "none",
  playMode: "sequential",
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setQueue: (tracks, currentTrackId) => set(() => {
    const full = tracks.length > INITIAL_QUEUE_LIMIT ? tracks.slice(0, INITIAL_QUEUE_LIMIT) : tracks;
    const index = currentTrackId ? full.findIndex((track) => track.id === currentTrackId) : 0;
    return {
      queue: full,
      queueIndex: index < 0 ? 0 : index,
      pendingQueue: tracks.length > INITIAL_QUEUE_LIMIT ? tracks.slice(INITIAL_QUEUE_LIMIT) : [],
    };
  }),
  setPendingQueue: (pendingQueue) => set({ pendingQueue }),
  appendPendingToQueue: (count) => set((state) => {
    if (count <= 0 || !state.pendingQueue.length) return {};
    const append = state.pendingQueue.slice(0, count);
    const rest = state.pendingQueue.slice(count);
    return { queue: [...state.queue, ...append], pendingQueue: rest };
  }),
  trimPlayedBehind: (keep = PLAYED_KEEP_BEHIND) => set((state) => {
    if (state.queueIndex <= keep) return {};
    const cut = state.queueIndex - keep;
    const queue = state.queue.slice(cut);
    return { queue, queueIndex: state.queueIndex - cut };
  }),
  removeFromQueue: (trackId) => set((state) => {
    const queue = state.queue.filter((track) => track.id !== trackId);
    const currentId = state.currentTrack?.id;
    return { queue, queueIndex: currentId ? queue.findIndex((track) => track.id === currentId) : -1 };
  }),
  clearQueue: () => set({ queue: [], queueIndex: -1, pendingQueue: [] }),
  setShuffleEnabled: (shuffleEnabled) => set({ shuffleEnabled }),
  cycleRepeatMode: () => set((state) => {
    const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const next = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
    return { repeatMode: next };
  }),
  cyclePlayMode: () => set((state) => {
    const modes: Array<"sequential" | "loop" | "shuffle"> = ["sequential", "loop", "shuffle"];
    const next = modes[(modes.indexOf(state.playMode) + 1) % modes.length];
    return { playMode: next, shuffleEnabled: next === "shuffle", repeatMode: next === "loop" ? "all" : "none" };
  }),
  cycleUnifiedMode: () => set((state) => {
    if (state.playMode === "sequential" && state.repeatMode === "none") {
      return { playMode: "shuffle", shuffleEnabled: true, repeatMode: "none" };
    }
    if (state.playMode === "shuffle") {
      return { playMode: "loop", shuffleEnabled: false, repeatMode: "all" };
    }
    if (state.repeatMode === "all") {
      return { playMode: "loop", shuffleEnabled: false, repeatMode: "one" };
    }
    return { playMode: "sequential", shuffleEnabled: false, repeatMode: "none" };
  }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress, duration) => set({ progress, duration }),
}));