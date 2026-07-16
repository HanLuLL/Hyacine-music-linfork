import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedCard({ children, className = "", style, ...props }: ThemedCardProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const usesGlass = preferences.uiStyle === "default" || preferences.uiStyle === "frosted" || preferences.uiStyle === "liquid";
  const blurIntensity = preferences.uiStyle === "frosted" ? 100 : preferences.uiStyle === "liquid" ? 80 : 28;

  return (
    <View
      className={`overflow-hidden border p-5 ${className}`}
      style={[
        {
          backgroundColor: preferences.uiStyle === "miui" ? tokens.surface : "transparent",
          borderColor: tokens.surfaceBorder,
          borderRadius: tokens.cardRadius,
          shadowColor: preferences.uiStyle === "miui" ? "#000000" : tokens.accent,
          shadowOpacity: preferences.uiStyle === "miui" ? 0.2 : 0.1,
          shadowRadius: preferences.uiStyle === "miui" ? 16 : 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: preferences.uiStyle === "miui" ? 8 : 2,
        },
        style,
      ]}
      {...props}
    >
      {usesGlass ? (
        <BlurView
          pointerEvents="none"
          className="absolute inset-0"
          intensity={Platform.OS === "ios" ? blurIntensity : 0}
          tint={tokens.isLight ? "light" : "dark"}
          style={{ backgroundColor: Platform.OS === "ios" ? tokens.surface : tokens.surfaceStrong }}
        />
      ) : null}
      {preferences.uiStyle === "liquid" ? (
        <LinearGradient
          pointerEvents="none"
          className="absolute inset-0"
          colors={["#ffffff4d", "#ffffff0d", "#ffffff00"]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
        />
      ) : null}
      {preferences.uiStyle === "liquid" ? (
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 top-0 h-px"
          style={{ backgroundColor: "#ffffffaa" }}
        />
      ) : null}
      {children}
    </View>
  );
}