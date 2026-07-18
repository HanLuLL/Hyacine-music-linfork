import { appLog } from "@/utils/logger";

let registered = false;

/**
 * Register Android headless playback service once, after the JS runtime is up.
 * Never import this from the app entry file.
 */
export function registerPlaybackServiceOnce(): void {
  if (registered) {
    appLog.info("playbackService", "already registered");
    return;
  }
  try {
    appLog.info("playbackService", "register start");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TrackPlayerModule = require("react-native-track-player");
    const TrackPlayer = TrackPlayerModule?.default ?? TrackPlayerModule;
    if (typeof TrackPlayer?.registerPlaybackService !== "function") {
      appLog.warn("playbackService", "registerPlaybackService unavailable");
      return;
    }
    TrackPlayer.registerPlaybackService(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./playbackService").default;
    });
    registered = true;
    appLog.info("playbackService", "register ok");
  } catch (error) {
    appLog.warn("playbackService", "registration skipped", error);
  }
}