const NETEASE_IMAGE_BY_ID = "https://music.163.com/api/img/blob/";

export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return `${NETEASE_IMAGE_BY_ID}${value}`;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return `https://${value.slice("http://".length)}`;
  return value;
}
