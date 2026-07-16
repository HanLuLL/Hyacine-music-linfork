import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MiniPlayer } from "@/components/Player/MiniPlayer";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme";

export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider>
      <I18nProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" options={{ presentation: "card" }} />
          <Stack.Screen name="player/[id]" options={{ presentation: "card" }} />
        </Stack>
        <MiniPlayer />
      </I18nProvider>
    </ThemeProvider>
  );
}