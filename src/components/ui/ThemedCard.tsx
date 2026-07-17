import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
// The liquid surface intentionally uses only transparent layers and a thin edge highlight.
import { useTheme } from "@/theme";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

function LiquidRefraction(): React.JSX.Element {
  return <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffff88" }} />;
}

export function ThemedCard({ children, className = "", style, ...props }: ThemedCardProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const isMiuix = preferences.uiStyle === "miuix";
  const isLiquid = preferences.uiStyle === "liquid";
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
          style={{ backgroundColor: "transparent" }}
        />
      ) : null}
      {isLiquid ? <LiquidRefraction /> : null}
      {children}
    </View>
  );
}