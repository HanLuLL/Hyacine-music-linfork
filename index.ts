// Sole app entry.
// Register TrackPlayer defensively so a missing/broken native module cannot
// hard-crash the process before Expo Router boots.
try {
  // Lazy require keeps native module failures catchable at startup.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const TrackPlayerModule = require("react-native-track-player");
  const TrackPlayer = TrackPlayerModule?.default ?? TrackPlayerModule;
  if (typeof TrackPlayer?.registerPlaybackService === "function") {
    TrackPlayer.registerPlaybackService(() => {
      // Load the service only when Android starts the headless task.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./src/services/playbackService").default;
    });
  } else {
    console.warn("[hyacine] TrackPlayer.registerPlaybackService unavailable");
  }
} catch (error) {
  console.warn("[hyacine] TrackPlayer registration skipped", error);
}

import "expo-router/entry";
