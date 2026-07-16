import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "@/theme";

interface ThemedScreenProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

function LiquidGlow({ color, position }: { color: string; position: "top" | "bottom" }): React.JSX.Element {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: position === "top" ? 9000 : 12000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [position, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + progress.value * 0.22,
    transform: [
      { translateX: (progress.value - 0.5) * (position === "top" ? 70 : -55) },
      { translateY: (progress.value - 0.5) * 38 },
      { scale: 0.92 + progress.value * 0.16 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className={position === "top" ? "absolute -right-28 -top-28 h-80 w-80 rounded-full" : "absolute -bottom-40 -left-32 h-96 w-96 rounded-full"}
      style={[{ backgroundColor: color }, animatedStyle]}
    />
  );
}

export function ThemedScreen({ children, className = "", style, ...props }: ThemedScreenProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const isMiui = preferences.uiStyle === "miui";
  const isLiquid = preferences.uiStyle === "liquid";
  const backgroundColors = isMiui
    ? ([tokens.background, tokens.background] as const)
    : ([tokens.background, tokens.backgroundSecondary, tokens.background] as const);

  return (
    <View className={`flex-1 overflow-hidden ${className}`} style={[{ backgroundColor: tokens.background }, style]} {...props}>
      <LinearGradient pointerEvents="none" className="absolute inset-0" colors={backgroundColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      {isLiquid ? (
        <>
          <LiquidGlow color={tokens.accent} position="top" />
          <LiquidGlow color={tokens.backgroundSecondary} position="bottom" />
        </>
      ) : !isMiui ? (
        <>
          <View pointerEvents="none" className="absolute -right-24 -top-24 h-72 w-72 rounded-full" style={{ backgroundColor: `${tokens.accent}20` }} />
          <View pointerEvents="none" className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full" style={{ backgroundColor: `${tokens.backgroundSecondary}aa` }} />
        </>
      ) : null}
      {children}
    </View>
  );
}