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

export async function toggleFavorite(track: Track, options?: { backendUrl?: string; cookie?: string | null }): Promise<boolean> {
  const favorites = await loadFavorites();
  const exists = favorites.some((item) => item.id === track.id);
  const songId = Number(track.id.replace("netease:", ""));
  if (options?.backendUrl && track.id.startsWith("netease:") && Number.isFinite(songId)) {
    const base = options.backendUrl.replace(/\/$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
    const response = await fetch(`${base}/music-sources/netease/favorites/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: songId, remove: exists, cookie: options.cookie ?? "" }) });
    const result = await response.json().catch(() => ({})) as { message?: string };
    if (!response.ok) throw new Error(result.message || "网易云收藏同步失败");
  }
  const next = exists ? favorites.filter((item) => item.id !== track.id) : [track, ...favorites];
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  return !exists;
}
