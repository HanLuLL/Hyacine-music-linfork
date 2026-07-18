// App entry: register TrackPlayer before Expo Router boots.
// Keep this as the only root entry (do not also keep a conflicting index.js).
import TrackPlayer from "react-native-track-player";
import playbackService from "./src/services/playbackService";

TrackPlayer.registerPlaybackService(() => playbackService);

import "expo-router/entry";
