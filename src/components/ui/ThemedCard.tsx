import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "@/theme";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

function LiquidRefraction(): React.JSX.Element {
  const firstProgress = useSharedValue(0);
  const secondProgress = useSharedValue(0);

  useEffect(() => {
    firstProgress.value = withRepeat(
      withTiming(1, { duration: 6200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    secondProgress.value = withRepeat(
      withTiming(1, { duration: 9400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [firstProgress, secondProgress]);

  const firstStyle = useAnimatedStyle(() => ({
    opacity: 0.38 + firstProgress.value * 0.28,
    transform: [
      { translateX: -84 + firstProgress.value * 168 },
      { translateY: -20 + firstProgress.value * 34 },
      { rotate: "-18deg" },
    ],
  }));
  const secondStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + secondProgress.value * 0.26,
    transform: [
      { translateX: 78 - secondProgress.value * 154 },
      { translateY: 30 - secondProgress.value * 42 },
      { rotate: "24deg" },
    ],
  }));

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        className="absolute inset-0"
        colors={["#ffffff38", "#dbeafe12", "#ffffff08"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View pointerEvents="none" className="absolute -left-20 -top-16 h-24 w-72" style={firstStyle}>
        <LinearGradient
          className="h-full w-full"
          colors={["#ffffff00", "#ffffffb3", "#ffffff00"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" className="absolute -right-20 -bottom-14 h-20 w-64" style={secondStyle}>
        <LinearGradient
          className="h-full w-full"
          colors={["#ffffff00", "#bfdbfe70", "#ffffff00"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>
      <LinearGradient
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 h-12"
        colors={["#ffffff94", "#ffffff16", "#ffffff00"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
    </>
  );
}

export function ThemedCard({ children, className = "", style, ...props }: ThemedCardProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const isMiui = preferences.uiStyle === "miui";
  const isFrosted = preferences.uiStyle === "frosted";
  const isLiquid = preferences.uiStyle === "liquid";

  const materialTint = tokens.isLight
    ? isLiquid
      ? "#ffffff42"
      : "#ffffff2e"
    : isLiquid
      ? "#0f172a3d"
      : "#0b102038";

  return (
    <View
      className={`overflow-hidden border p-5 ${className}`}
      style={[
        {
          backgroundColor: isMiui || (!isFrosted && !isLiquid) ? tokens.surface : "transparent",
          borderColor: isLiquid ? "#ffffffa8" : tokens.surfaceBorder,
          borderRadius: tokens.cardRadius,
          shadowColor: isLiquid ? "#60a5fa" : "#000000",
          shadowOpacity: isLiquid ? 0.3 : isMiui ? 0.08 : 0,
          shadowRadius: isLiquid ? 26 : isMiui ? 8 : 0,
          shadowOffset: { width: 0, height: isLiquid ? 14 : 3 },
          elevation: isLiquid ? 8 : isMiui ? 2 : 0,
        },
        style,
      ]}
      {...props}
    >
      {isFrosted || isLiquid ? (
        <BlurView
          pointerEvents="none"
          className="absolute inset-0"
          intensity={Platform.OS === "ios" ? (isFrosted ? 90 : 55) : 18}
          tint={tokens.isLight ? "light" : "dark"}
          style={{ backgroundColor: materialTint }}
        />
      ) : null}
      {isFrosted ? (
        <>
          <View pointerEvents="none" className="absolute inset-0" style={{ backgroundColor: tokens.isLight ? "#ffffff14" : "#ffffff08" }} />
          <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffff8f" }} />
        </>
      ) : null}
      {isLiquid ? <LiquidRefraction /> : null}
      {children}
    </View>
  );
}