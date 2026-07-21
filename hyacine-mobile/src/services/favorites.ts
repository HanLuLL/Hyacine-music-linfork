import * as SecureStore from "expo-secure-store";
import type { Track } from "@/types/music";
import { appLog } from "@/utils/logger";
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
  const next = exists ? favorites.filter((item) => item.id !== track.id) : [track, ...favorites];
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  const songId = Number(track.id.replace("netease:", ""));
  if (options?.backendUrl && track.id.startsWith("netease:") && Number.isFinite(songId) && options.cookie) {
    try {
      const base = options.backendUrl.replace(/\/$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
      const response = await fetch(`${base}/music-sources/netease/favorites/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: songId, remove: exists, cookie: options.cookie }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { message?: string };
        appLog.warn("favorites", "netease sync failed", { message: result.message });
      }
    } catch (error) {
      appLog.warn("favorites", "netease sync error", error);
    }
  }
  return !exists;
}
