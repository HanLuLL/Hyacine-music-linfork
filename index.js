// Custom entry: register TrackPlayer headless service before Expo Router boots.
// Without this, Android often crashes shortly after the first play() call.
import TrackPlayer from 'react-native-track-player';
import playbackService from './src/services/playbackService';

TrackPlayer.registerPlaybackService(() => playbackService);

import 'expo-router/entry';
