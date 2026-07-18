import { useEffect, useRef, useState } from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, View, type ColorValue, type LayoutChangeEvent } from "react-native";
import { BlurView } from "expo-blur";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";

const tabs = [
  { route: "/(tabs)", symbol: "⌂", key: "home" },
  { route: "/(tabs)/search", symbol: "⌕", key: "search" },
  { route: "/(tabs)/library", symbol: "♫", key: "library" },
] as const;

const HUAWEI_BLUE = "#00A1FF";
const HUAWEI_GRAY = "#86909C";

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }): React.JSX.Element {
  return <Text style={{ color, fontSize: 19, fontWeight: "700" }}>{symbol}</Text>;
}

function HuaweiFloatingNav(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { togglePlayback } = useAudio();
  const playing = usePlayerStore((s) => s.isPlaying);
  const activeIndex = pathname.includes("/search") ? 1 : pathname.includes("/library") ? 2 : 0;
  const position = useRef(new Animated.Value(activeIndex)).current;
  const activeIndexRef = useRef(activeIndex);
  const tabWidthRef = useRef(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const tabWidth = contentWidth / tabs.length;

  useEffect(() => {
    const handler = Dimensions.addEventListener("change", ({ window }) => setScreenWidth(window.width));
    return () => handler.remove();
  }, []);

  const navWidth = screenWidth < 600 ? 200 : screenWidth < 840 ? 300 : 400;

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => {
    if (!tabWidth) return;
    Animated.spring(position, { toValue: activeIndex, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
  }, [activeIndex, position, tabWidth]);

  const switchTo = (index: number): void => {
    const next = Math.max(0, Math.min(tabs.length - 1, index));
    if (next === activeIndexRef.current) {
      Animated.spring(position, { toValue: activeIndexRef.current, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
      return;
    }
    router.replace(tabs[next].route);
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderGrant: () => position.stopAnimation(),
    onPanResponderMove: (_, g) => {
      if (!tabWidthRef.current) return;
      position.setValue(Math.max(0, Math.min(tabs.length - 1, activeIndexRef.current + g.dx / tabWidthRef.current)));
    },
    onPanResponderRelease: (_, g) => {
      if (!tabWidthRef.current) return;
      const d = g.dx / tabWidthRef.current;
      const off = Math.abs(g.vx) > 0.45 ? (g.vx > 0 ? 1 : -1) : Math.round(d);
      switchTo(activeIndexRef.current + off);
    },
    onPanResponderTerminate: () => {
      Animated.spring(position, { toValue: activeIndexRef.current, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
    },
  })).current;

  const onLayout = (e: LayoutChangeEvent): void => {
    const w = e.nativeEvent.layout.width;
    tabWidthRef.current = w / tabs.length;
    setContentWidth(w);
  };

  return (
    <View pointerEvents="box-none" style={[s.navWrap, { width: navWidth, alignSelf: "center" }]}>
      <View style={s.navBg}>
        <BlurView intensity={playing ? 90 : 85} tint="light" style={StyleSheet.absoluteFill} />
        <View style={s.navTopLine} />
      </View>
      <View style={s.navContent} onLayout={onLayout} {...panResponder.panHandlers}>
        {tabs.map((tab, i) => {
          const active = i === activeIndex;
          const focus = position.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [0, 1, 0], extrapolate: "clamp" });
          const scale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
          return (
            <Pressable key={tab.key} style={s.tabBtn} onPress={() => switchTo(i)}>
              <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
                <Text style={{ color: active ? HUAWEI_BLUE : HUAWEI_GRAY, fontSize: 24 }}>{tab.symbol}</Text>
                <Text style={{ color: active ? HUAWEI_BLUE : HUAWEI_GRAY, fontSize: 10, fontWeight: active ? "700" : "500", marginTop: 2 }}>{t(tab.key)}</Text>
                {active ? <View style={{ marginTop: 2, height: 2, width: 20, borderRadius: 1, backgroundColor: HUAWEI_BLUE }} /> : null}
              </Animated.View>
            </Pressable>
          );
        })}
        <Pressable style={s.playBtn} onPress={() => void togglePlayback()}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>{playing ? "Ⅱ" : "▶"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  navWrap: { position: "absolute", bottom: 28, height: 64 },
  navBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.58)", shadowColor: "#182848", shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8, overflow: "hidden" },
  navTopLine: { position: "absolute", left: 0, right: 0, top: 0, height: 1, backgroundColor: "rgba(255,255,255,0.78)" },
  navContent: { position: "absolute", top: 2, bottom: 2, left: 6, right: 4, flexDirection: "row", alignItems: "center" },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: HUAWEI_BLUE, alignItems: "center", justifyContent: "center", marginRight: 4 },
});

export default function TabsLayout(): React.JSX.Element {
  const { t } = useI18n();
  const { preferences, tokens } = useTheme();
  const isLiquid = preferences.uiStyle === "liquid";
  const isMiuix = preferences.uiStyle === "miuix";
  return (
    <View className="flex-1">
      <Tabs screenOptions={{
        headerShown: false,
        animation: "shift",
        transitionSpec: { animation: "spring", config: { stiffness: 320, damping: 28, mass: 0.78, overshootClamping: false } },
        sceneStyle: { backgroundColor: tokens.background },
        tabBarStyle: { display: isLiquid || isMiuix ? "none" : "flex" },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.mutedText,
      }}>
        <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} />
        <Tabs.Screen name="search" options={{ title: t("search"), tabBarIcon: ({ color }) => <TabIcon symbol="⌕" color={color} /> }} />
        <Tabs.Screen name="library" options={{ title: t("library"), tabBarIcon: ({ color }) => <TabIcon symbol="♫" color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <TabIcon symbol="◉" color={color} /> }} />
      </Tabs>
      {isLiquid ? <HuaweiFloatingNav /> : null}
    </View>
  );
}