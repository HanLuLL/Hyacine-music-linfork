import { create } from "zustand";
import type { Track } from "@/types/music";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: "none" | "one" | "all";
  playMode: "sequential" | "loop" | "shuffle";
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[], currentTrackId?: string) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setShuffleEnabled: (enabled: boolean) => void;
  cycleRepeatMode: () => void;
  cyclePlayMode: () => void;
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
  shuffleEnabled: false,
  repeatMode: "none",
  playMode: "sequential",
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setQueue: (queue, currentTrackId) => set({
    queue,
    queueIndex: currentTrackId ? queue.findIndex((track) => track.id === currentTrackId) : 0,
  }),
  removeFromQueue: (trackId) => set((state) => {
    const queue = state.queue.filter((track) => track.id !== trackId);
    const currentId = state.currentTrack?.id;
    return { queue, queueIndex: currentId ? queue.findIndex((track) => track.id === currentId) : -1 };
  }),
  clearQueue: () => set({ queue: [], queueIndex: -1 }),
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
setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress, duration) => set({ progress, duration }),
}));