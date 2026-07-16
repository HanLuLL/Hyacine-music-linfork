import { useEffect, useRef, useState } from "react";
import { Tabs, usePathname, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Animated, PanResponder, Platform, Pressable, Text, View, type ColorValue, type LayoutChangeEvent } from "react-native";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";

const tabs = [
  { route: "/(tabs)", symbol: "⌂", key: "home" },
  { route: "/(tabs)/search", symbol: "⌕", key: "search" },
  { route: "/(tabs)/library", symbol: "♫", key: "library" },
  { route: "/(tabs)/profile", symbol: "◉", key: "profile" },
] as const;

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }): React.JSX.Element {
  return <Text style={{ color, fontSize: 19, fontWeight: "700" }}>{symbol}</Text>;
}

function LiquidTabBar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { tokens } = useTheme();
  const activeIndex = pathname.includes("/search") ? 1 : pathname.includes("/library") ? 2 : pathname.includes("/profile") ? 3 : 0;
  const position = useRef(new Animated.Value(activeIndex)).current;
  const activeIndexRef = useRef(activeIndex);
  const tabWidthRef = useRef(0);
  const [contentWidth, setContentWidth] = useState(0);
  const tabWidth = contentWidth / tabs.length;

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => {
    if (!tabWidth) return;
    Animated.spring(position, { toValue: activeIndex, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
  }, [activeIndex, position, tabWidth]);

  const switchTo = (index: number): void => {
    const nextIndex = Math.max(0, Math.min(tabs.length - 1, index));
    if (nextIndex === activeIndexRef.current) {
      Animated.spring(position, { toValue: activeIndexRef.current, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
      return;
    }
    router.replace(tabs[nextIndex].route);
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => position.stopAnimation(),
    onPanResponderMove: (_, gesture) => {
      if (!tabWidthRef.current) return;
      const next = Math.max(0, Math.min(tabs.length - 1, activeIndexRef.current + gesture.dx / tabWidthRef.current));
      position.setValue(next);
    },
    onPanResponderRelease: (_, gesture) => {
      if (!tabWidthRef.current) return;
      const distance = gesture.dx / tabWidthRef.current;
      const velocity = gesture.vx;
      const offset = Math.abs(velocity) > 0.45 ? (velocity > 0 ? 1 : -1) : Math.round(distance);
      switchTo(activeIndexRef.current + offset);
    },
    onPanResponderTerminate: () => {
      Animated.spring(position, { toValue: activeIndexRef.current, useNativeDriver: true, stiffness: 240, damping: 24, mass: 0.72 }).start();
    },
  })).current;

  const onContentLayout = (event: LayoutChangeEvent): void => {
    const width = event.nativeEvent.layout.width;
    tabWidthRef.current = width / tabs.length;
    setContentWidth(width);
  };

  return <View pointerEvents="box-none" className="absolute bottom-3 left-4 right-4 h-[76px]">
    <View className="absolute inset-0 overflow-hidden rounded-[38px] border" style={{ backgroundColor: Platform.OS === "ios" ? "#ffffff30" : "#ffffff40", borderColor: "#ffffffc0", shadowColor: "#182848", shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 9 }}>
      {Platform.OS === "ios" ? <BlurView intensity={70} tint={tokens.isLight ? "light" : "dark"} className="absolute inset-0" /> : null}
      <View className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffffdc" }} />
    </View>
    <View className="absolute bottom-1.5 left-1.5 right-1.5 top-1.5" onLayout={onContentLayout} {...panResponder.panHandlers}>
      {tabWidth ? <LensPosition position={position} tabWidth={tabWidth} /> : null}
      <View pointerEvents="box-none" className="flex-1 flex-row">
        {tabs.map((tab, index) => { const active = index === activeIndex; const focus = position.interpolate({ inputRange: [index - 1, index, index + 1], outputRange: [0, 1, 0], extrapolate: "clamp" }); const scale = focus.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.12] }); const opacity = focus.interpolate({ inputRange: [0, 1], outputRange: [0.48, 1] }); return <Pressable key={tab.key} className="flex-1 items-center justify-center" onPress={() => switchTo(index)}>
          <Animated.View className="h-[60px] items-center justify-center" style={{ opacity, transform: [{ scale }] }}><Text style={{ color: active ? tokens.text : tokens.mutedText, fontSize: 21, fontWeight: "800" }}>{tab.symbol}</Text><Text className="mt-0.5" style={{ color: active ? tokens.text : tokens.mutedText, fontSize: 10, fontWeight: "800" }}>{t(tab.key)}</Text></Animated.View>
        </Pressable>; })}
      </View>
    </View>
  </View>;
}

function LensPosition({ position, tabWidth }: { position: Animated.Value; tabWidth: number }): React.JSX.Element {
  const { tokens } = useTheme();
  const translateX = position.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, tabWidth, tabWidth * 2, tabWidth * 3] });
  return <Animated.View pointerEvents="none" className="absolute bottom-0 top-0 overflow-hidden rounded-[30px] border" style={{ width: tabWidth, backgroundColor: Platform.OS === "ios" ? "#ffffff5c" : "#ffffff74", borderColor: "#ffffffdc", shadowColor: tokens.isLight ? "#ffffff" : "#93c5fd", shadowOpacity: 0.65, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, transform: [{ translateX }] }}>
    {Platform.OS === "ios" ? <BlurView intensity={44} tint={tokens.isLight ? "light" : "dark"} className="absolute inset-0" /> : null}
    <View className="absolute left-3 right-3 top-0 h-px" style={{ backgroundColor: "#ffffffef" }} />
  </Animated.View>;
}

export default function TabsLayout(): React.JSX.Element {
  const { t } = useI18n();
  const { preferences, tokens } = useTheme();
  const isLiquid = preferences.uiStyle === "liquid";
  const isMiuix = preferences.uiStyle === "miuix";

  return <View className="flex-1"><Tabs screenOptions={{
    headerShown: false,
    sceneStyle: { backgroundColor: tokens.background },
    tabBarStyle: {
      display: isLiquid ? "none" : "flex",
      position: isMiuix ? "absolute" : "relative",
      left: isMiuix ? 16 : 0,
      right: isMiuix ? 16 : 0,
      bottom: isMiuix ? 12 : 0,
      height: isMiuix ? 66 : 62,
      paddingTop: 7,
      paddingBottom: 7,
      borderRadius: isMiuix ? 24 : 0,
      backgroundColor: tokens.surfaceStrong,
      borderColor: tokens.surfaceBorder,
      borderTopWidth: 1,
      borderWidth: isMiuix ? 1 : 0,
      elevation: isMiuix ? 3 : 0,
      shadowColor: "#000000",
      shadowOpacity: isMiuix ? 0.08 : 0,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 7 },
    },
    tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
    tabBarActiveTintColor: tokens.accent,
    tabBarInactiveTintColor: tokens.mutedText,
  }}>
    <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} />
    <Tabs.Screen name="search" options={{ title: t("search"), tabBarIcon: ({ color }) => <TabIcon symbol="⌕" color={color} /> }} />
    <Tabs.Screen name="library" options={{ title: t("library"), tabBarIcon: ({ color }) => <TabIcon symbol="♫" color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <TabIcon symbol="◉" color={color} /> }} />
  </Tabs>{isLiquid ? <LiquidTabBar /> : null}</View>;
}