import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { useI18n } from "@/i18n";

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }): React.JSX.Element {
  return <Text style={{ color, fontSize: 19, fontWeight: "700" }}>{symbol}</Text>;
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#09090b" },
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#10110f",
          borderTopColor: "#262822",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarActiveTintColor: "#d7f56a",
        tabBarInactiveTintColor: "#85877f",
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: t("search"), tabBarIcon: ({ color }) => <TabIcon symbol="⌕" color={color} /> }} />
      <Tabs.Screen name="library" options={{ title: t("library"), tabBarIcon: ({ color }) => <TabIcon symbol="♫" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <TabIcon symbol="◉" color={color} /> }} />
    </Tabs>
  );
}