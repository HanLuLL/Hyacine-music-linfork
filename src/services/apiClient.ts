import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/config";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await SecureStore.getItemAsync("accessToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
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