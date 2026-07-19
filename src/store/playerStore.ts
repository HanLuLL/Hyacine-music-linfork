import { create } from "zustand";
import type { Track } from "@/types/music";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[], currentTrackId?: string) => void;
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
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setQueue: (queue, currentTrackId) => set({
    queue,
    queueIndex: currentTrackId ? queue.findIndex((track) => track.id === currentTrackId) : 0,
  }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress, duration) => set({ progress, duration }),
}));