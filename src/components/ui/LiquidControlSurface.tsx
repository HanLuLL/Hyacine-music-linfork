import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme";

interface LiquidControlSurfaceProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function LiquidControlSurface({ children, className = "", style, ...props }: LiquidControlSurfaceProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const liquid = preferences.uiStyle === "liquid";

  return <View
    className={`overflow-hidden border ${className}`}
    style={[
      {
        backgroundColor: liquid ? "transparent" : tokens.surfaceStrong,
        borderColor: liquid ? "#ffffff8c" : tokens.surfaceBorder,
        shadowColor: liquid ? "#24364f" : "#000000",
        shadowOpacity: liquid ? 0.13 : 0,
        shadowRadius: liquid ? 16 : 0,
        shadowOffset: { width: 0, height: 7 },
        elevation: liquid ? 4 : 0,
      },
      style,
    ]}
    {...props}
  >
    {liquid && Platform.OS === "ios" ? <BlurView pointerEvents="none" intensity={36} tint={tokens.isLight ? "light" : "dark"} className="absolute inset-0" /> : null}
    {liquid ? <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffffaa" }} /> : null}
    {children}
  </View>;
}
