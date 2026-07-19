import { apiBase } from "@/utils/apiBase";

export interface SongComment {
  id: number;
  nickname: string;
  avatarUrl?: string;
  content: string;
  time: number;
  timeText?: string;
  likedCount: number;
  location?: string;
}

export interface SongCommentsPage {
  total: number;
  more: boolean;
  comments: SongComment[];
}

export async function loadSongComments(backendUrl: string, trackId: string, cookie?: string | null): Promise<SongCommentsPage> {
  if (!trackId.startsWith("netease:")) return { total: 0, more: false, comments: [] };
  const id = Number(trackId.slice(8));
  if (!id) return { total: 0, more: false, comments: [] };
  const response = await fetch(`${apiBase(backendUrl)}/music-sources/netease/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, cookie: cookie ?? undefined, limit: 30 }),
  });
  if (!response.ok) throw new Error("评论加载失败");
  return await response.json() as SongCommentsPage;
}