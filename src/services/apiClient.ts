import * as SecureStore from "expo-secure-store";
import { apiBase } from "@/utils/apiBase";

const PROFILE_KEY = "hyacine.account-profile";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function resolveApiBaseUrl(): Promise<string> {
  const raw = await SecureStore.getItemAsync(PROFILE_KEY);
  if (raw) {
    try {
      const profile = JSON.parse(raw) as { backendUrl?: string };
      const base = apiBase(profile.backendUrl);
      if (base) return base;
    } catch {
      // ignore invalid profile payload
    }
  }
  const envBase = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envBase) return apiBase(envBase);
  throw new ApiError(0, "未配置服务器地址，请先在引导页填写后端地址");
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await SecureStore.getItemAsync("accessToken");
  const base = await resolveApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${base}${normalizedPath}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(response.status, body?.message ?? "Request failed");
  }
  return response.json() as Promise<T>;
}
