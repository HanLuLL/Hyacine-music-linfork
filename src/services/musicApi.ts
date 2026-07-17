import { apiBase } from "@/utils/apiBase";
import type { Track } from "@/types/music";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as T & { message?: string };
  if (!response.ok) {
    throw new Error((data as { message?: string } | null)?.message ?? `HTTP ${response.status}`);
  }
  return data;
}

export async function searchTracks(options: {
  backendUrl: string;
  source: "netease" | "bilibili";
  keywords: string;
  cookie?: string | null;
}): Promise<Track[]> {
  const base = apiBase(options.backendUrl);
  const keywords = options.keywords.trim();
  if (!base || !keywords) return [];

  if (options.source === "netease") {
    const rows = await postJson<
      Array<{
        id: number;
        title: string;
        artists: string[];
        coverUrl?: string;
        durationMs?: number;
      }>
    >(`${base}/music-sources/netease/search`, {
      keywords,
      limit: 30,
      cookie: options.cookie ?? undefined,
    });
    return rows.map((item) => ({
      id: `netease:${item.id}`,
      title: item.title,
      artist: (item.artists ?? []).join(" / ") || "网易云",
      url: "",
      artwork: item.coverUrl,
      duration: item.durationMs ? Math.round(item.durationMs / 1000) : undefined,
    }));
  }

  const rows = await postJson<
    Array<{
      id: string;
      title: string;
      artists: string[];
      coverUrl?: string;
      duration?: string;
    }>
  >(`${base}/music-sources/bilibili/search`, {
    keywords,
    limit: 30,
    cookie: options.cookie ?? undefined,
  });
  return rows.map((item) => ({
    id: `bilibili:${item.id}`,
    title: item.title,
    artist: (item.artists ?? []).join(" / ") || "哔哩哔哩",
    url: "",
    artwork: item.coverUrl,
  }));
}

export async function resolvePlayableTrack(options: {
  backendUrl: string;
  track: Track;
  cookie?: string | null;
}): Promise<Track> {
  const base = apiBase(options.backendUrl);
  if (!base) throw new Error("未配置服务器地址");

  if (options.track.id.startsWith("netease:")) {
    const id = Number(options.track.id.replace("netease:", ""));
    const result = await postJson<{ url: string; br?: number }>(`${base}/music-sources/netease/play-url`, {
      id,
      level: "exhigh",
      cookie: options.cookie ?? undefined,
    });
    if (!result.url) throw new Error("未获取到网易云播放地址");
    return { ...options.track, url: result.url };
  }

  if (options.track.id.startsWith("bilibili:")) {
    const id = options.track.id.replace("bilibili:", "");
    const result = await postJson<{ url: string; quality?: string; cid?: string }>(
      `${base}/music-sources/bilibili/play-url`,
      {
        id,
        cookie: options.cookie ?? undefined,
      },
    );
    if (!result.url) throw new Error("未获取到 Bilibili 播放地址");
    return { ...options.track, url: result.url };
  }

  if (options.track.url) return options.track;
  throw new Error("无法解析该音源的播放地址");
}
