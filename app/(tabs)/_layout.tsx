import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Platform, Text, type ColorValue } from "react-native";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }): React.JSX.Element {
  return <Text style={{ color, fontSize: 19, fontWeight: "700" }}>{symbol}</Text>;
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useI18n();
  const { preferences, tokens } = useTheme();
  const isLiquid = preferences.uiStyle === "liquid";
  const isMiuix = preferences.uiStyle === "miuix";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: tokens.background },
        tabBarStyle: {
          position: isLiquid || isMiuix ? "absolute" : "relative",
          left: isLiquid || isMiuix ? 16 : 0,
          right: isLiquid || isMiuix ? 16 : 0,
          bottom: isLiquid || isMiuix ? 14 : 0,
          height: isLiquid ? 64 : isMiuix ? 66 : 62,
          paddingTop: 7,
          paddingBottom: 7,
          borderRadius: isLiquid ? 32 : isMiuix ? 24 : 0,
          backgroundColor: isLiquid ? (Platform.OS === "ios" ? `${tokens.surfaceStrong}b8` : "#ffffff32") : tokens.surfaceStrong,
          borderColor: tokens.surfaceBorder,
          borderTopWidth: 1,
          borderWidth: isLiquid || isMiuix ? 1 : 0,
          elevation: isLiquid ? 8 : isMiuix ? 3 : 0,
          shadowColor: isLiquid ? "#182848" : "#000000",
          shadowOpacity: isLiquid ? 0.2 : isMiuix ? 0.08 : 0,
          shadowRadius: isLiquid ? 20 : 10,
          shadowOffset: { width: 0, height: 7 },
        },
        tabBarBackground: isLiquid && Platform.OS === "ios"
          ? () => <BlurView intensity={68} tint={tokens.isLight ? "light" : "dark"} style={{ flex: 1 }} />
          : undefined,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.mutedText,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: t("search"), tabBarIcon: ({ color }) => <TabIcon symbol="⌕" color={color} /> }} />
      <Tabs.Screen name="library" options={{ title: t("library"), tabBarIcon: ({ color }) => <TabIcon symbol="♫" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <TabIcon symbol="◉" color={color} /> }} />
    </Tabs>
  );
}