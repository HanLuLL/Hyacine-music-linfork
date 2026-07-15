import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import TrackPlayer from "react-native-track-player";
import { StatusBar } from "expo-status-bar";
import { MiniPlayer } from "@/components/Player/MiniPlayer";
import playbackService from "@/services/playbackService";

TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    // The service only works in a custom development or production build.
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ presentation: "card" }} />
      </Stack>
      <MiniPlayer />
    </>
  );
}