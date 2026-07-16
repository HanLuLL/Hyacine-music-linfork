import "../global.css";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MiniPlayer } from "@/components/Player/MiniPlayer";
import { AccountProvider, useAccount } from "@/account";
import { I18nProvider } from "@/i18n";
import { ThemeProvider, useTheme } from "@/theme";

function AppNavigator(): React.JSX.Element {
  const { hydrated, profile } = useAccount();
  const { tokens } = useTheme();

  if (!hydrated) return <View className="flex-1 items-center justify-center" style={{ backgroundColor: tokens.background }}><ActivityIndicator color={tokens.accent} /></View>;

  if (!profile) return <Stack screenOptions={{ headerShown: false, animation: "fade" }}><Stack.Screen name="onboarding" /></Stack>;
  if (!profile.musicSource) return <Stack screenOptions={{ headerShown: false, animation: "fade" }}><Stack.Screen name="sources" /></Stack>;

  return <>
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: "card" }} />
      <Stack.Screen name="sources" options={{ presentation: "card" }} />
      <Stack.Screen name="settings" options={{ presentation: "card" }} />
      <Stack.Screen name="player/[id]" options={{ presentation: "card" }} />
    </Stack>
    <MiniPlayer />
  </>;
}

export default function RootLayout(): React.JSX.Element {
  return <ThemeProvider><I18nProvider><AccountProvider><StatusBar style="light" /><AppNavigator /></AccountProvider></I18nProvider></ThemeProvider>;
}