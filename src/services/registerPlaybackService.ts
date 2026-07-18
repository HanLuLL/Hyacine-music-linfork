let registered = false;

/**
 * Register Android headless playback service once, after the JS runtime is up.
 * Never import this from the app entry file.
 */
export function registerPlaybackServiceOnce(): void {
  if (registered) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TrackPlayerModule = require("react-native-track-player");
    const TrackPlayer = TrackPlayerModule?.default ?? TrackPlayerModule;
    if (typeof TrackPlayer?.registerPlaybackService !== "function") {
      console.warn("[hyacine] TrackPlayer.registerPlaybackService unavailable");
      return;
    }
    TrackPlayer.registerPlaybackService(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./playbackService").default;
    });
    registered = true;
  } catch (error) {
    console.warn("[hyacine] TrackPlayer registration skipped", error);
  }
}
