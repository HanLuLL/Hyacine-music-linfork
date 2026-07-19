import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";

const tabs = [
  { name: "index", titleKey: "home", symbol: "⌂" },
  { name: "search", titleKey: "search", symbol: "⌕" },
  { name: "library", titleKey: "library", symbol: "♫" },
  { name: "profile", titleKey: "profile", symbol: "◉" },
] as const;

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }): React.JSX.Element {
  return <Text style={{ color, fontSize: 19, fontWeight: "700" }}>{symbol}</Text>;
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "fade",
        sceneStyle: { backgroundColor: tokens.background },
        tabBarStyle: {
          height: 62,
          paddingTop: 7,
          paddingBottom: 7,
          backgroundColor: tokens.surfaceStrong,
          borderTopColor: tokens.surfaceBorder,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.mutedText,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ color }) => <TabIcon symbol={tab.symbol} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
