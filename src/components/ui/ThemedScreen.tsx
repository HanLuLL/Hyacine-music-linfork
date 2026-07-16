import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "@/theme";

interface ThemedScreenProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

function LiquidField({ color, reverse = false }: { color: string; reverse?: boolean }): React.JSX.Element {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: reverse ? 13000 : 9800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [progress, reverse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + progress.value * 0.28,
    transform: [
      { translateX: (progress.value - 0.5) * (reverse ? -150 : 160) },
      { translateY: (progress.value - 0.5) * (reverse ? -90 : 110) },
      { scale: 0.88 + progress.value * 0.24 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className={reverse ? "absolute -bottom-40 -left-40 h-[31rem] w-[31rem] rounded-full" : "absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full"}
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
          <LiquidField color={tokens.accent} />
          <LiquidField color={tokens.backgroundSecondary} reverse />
          <LinearGradient
            pointerEvents="none"
            className="absolute inset-0"
            colors={["#ffffff00", "#ffffff12", "#ffffff00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
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