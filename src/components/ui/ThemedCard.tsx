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
  const isMiuix = preferences.uiStyle === "miuix";
  const isLiquid = preferences.uiStyle === "liquid";
  const materialTint = tokens.isLight ? "#ffffff12" : "#08101f24";
  const supportsBackdropBlur = Platform.OS === "ios";

  return (
    <View
      className={`overflow-hidden border p-5 ${className}`}
      style={[
        {
          backgroundColor: isLiquid ? "transparent" : tokens.surface,
          borderColor: isLiquid ? "#ffffff8c" : tokens.surfaceBorder,
          borderRadius: tokens.cardRadius,
          shadowColor: isLiquid ? "#31415f" : "#000000",
          shadowOpacity: isLiquid ? 0.1 : isMiuix ? 0.07 : 0,
          shadowRadius: isLiquid ? 14 : isMiuix ? 10 : 0,
          shadowOffset: { width: 0, height: isLiquid ? 7 : 4 },
          elevation: isLiquid ? 3 : isMiuix ? 2 : 0,
        },
        style,
      ]}
      {...props}
    >
      {isLiquid && supportsBackdropBlur ? (
        <BlurView
          pointerEvents="none"
          className="absolute inset-0"
          intensity={72}
          tint={tokens.isLight ? "light" : "dark"}
          style={{ backgroundColor: materialTint }}
        />
      ) : null}
      {isLiquid ? <LiquidRefraction /> : null}
      {children}
    </View>
  );
}