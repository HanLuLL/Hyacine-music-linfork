import { Platform } from "react-native";
import { appLog } from "@/utils/logger";
import { FluidCloud, type NowPlayingData } from "../../modules/expo-fluid-cloud/src";

let availabilityCache: boolean | null = null;

export async function isFluidCloudAvailable(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (availabilityCache !== null) return availabilityCache;
  try {
    availabilityCache = await FluidCloud.isAvailable();
  } catch (e) {
    appLog.info("fluid-cloud", "availability check failed", { error: String(e) });
    availabilityCache = false;
  }
  return availabilityCache;
}

export async function updateFluidCloudNowPlaying(data: NowPlayingData): Promise<void> {
  if (Platform.OS !== "android") return;
  if (!(await isFluidCloudAvailable())) return;
  try {
    await FluidCloud.updateNowPlaying(data);
  } catch (e) {
    appLog.warn("fluid-cloud", "updateNowPlaying failed", { error: String(e) });
  }
}

export async function removeFluidCloudNowPlaying(): Promise<void> {
  if (Platform.OS !== "android") return;
  if (!(await isFluidCloudAvailable())) return;
  try {
    await FluidCloud.removeNowPlaying();
  } catch (e) {
    appLog.warn("fluid-cloud", "removeNowPlaying failed", { error: String(e) });
  }
}