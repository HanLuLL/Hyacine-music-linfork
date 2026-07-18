import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MiniPlayer } from "@/components/Player/MiniPlayer";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { AccountProvider, useAccount } from "@/account";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme";

function AppNavigator(): React.JSX.Element {
  const { hydrated, profile } = useAccount();

  if (!hydrated) return <AppLoadingScreen />;
  if (!profile || !profile.onboardingCompleted) {
    return (
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }
  if (!profile.musicSource) {
    return (
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="sources" />
      </Stack>
    );
  }
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          animationDuration: 260,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: "card" }} />
        <Stack.Screen name="sources" options={{ presentation: "card" }} />
        <Stack.Screen name="settings" options={{ presentation: "card" }} />
        <Stack.Screen name="player/[id]" options={{ presentation: "card" }} />
      </Stack>
      <MiniPlayer />
    </>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AccountProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AccountProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
