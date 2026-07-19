import * as SecureStore from "expo-secure-store";
import type { Track } from "@/types/music";

const STORAGE_KEY = "hyacine.favorite-tracks";

export async function loadFavorites(): Promise<Track[]> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as Track[];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function isFavorite(id: string): Promise<boolean> {
  return (await loadFavorites()).some((track) => track.id === id);
}

export async function toggleFavorite(track: Track): Promise<boolean> {
  const favorites = await loadFavorites();
  const exists = favorites.some((item) => item.id === track.id);
  const next = exists ? favorites.filter((item) => item.id !== track.id) : [track, ...favorites];
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  return !exists;
}
