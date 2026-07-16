import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";
import { useTheme } from "@/theme";

const brandIcon = require("../../../assets/icon.png");

export function AppLoadingScreen(): React.JSX.Element {
  const { tokens } = useTheme();
  const breathe = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const rotate = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }));
    pulse.start();
    rotate.start();
    return () => { pulse.stop(); rotate.stop(); };
  }, [breathe, spin]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] });
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return <View className="flex-1 items-center justify-center" style={{ backgroundColor: tokens.background }}>
    <Animated.View className="absolute h-36 w-36 rounded-full border-2" style={{ borderColor: `${tokens.accent}55`, transform: [{ rotate }] }} />
    <Animated.View className="h-24 w-24 overflow-hidden rounded-[30px]" style={{ opacity, transform: [{ scale }], shadowColor: tokens.accent, shadowOpacity: 0.32, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 }}>
      <Image className="h-full w-full" source={brandIcon} resizeMode="cover" />
    </Animated.View>
    <Text className="mt-7 text-lg font-bold" style={{ color: tokens.text }}>风堇音乐</Text>
    <View className="mt-3 h-1 w-16 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.text}18` }}><Animated.View className="h-full w-10 rounded-full" style={{ backgroundColor: tokens.accent, transform: [{ translateX: breathe.interpolate({ inputRange: [0, 1], outputRange: [-24, 28] }) }] }} /></View>
  </View>;
}