import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";

interface ThemedScreenProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedScreen({ children, className = "", style, ...props }: ThemedScreenProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const isLiquid = preferences.uiStyle === "liquid";
  const isMiuix = preferences.uiStyle === "miuix";

  return (
    <View className={`flex-1 overflow-hidden ${className}`} style={[{ backgroundColor: tokens.background }, style]} {...props}>
      {isLiquid ? (
        <>
          <LinearGradient
            pointerEvents="none"
            className="absolute inset-0"
            colors={tokens.isLight
              ? ["#cfe5ff", "#f5f8ff", "#d9ecff", "#f8f4ff"]
              : [tokens.background, "#162745", "#151a33", tokens.backgroundSecondary]}
            locations={[0, 0.34, 0.68, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            pointerEvents="none"
            className="absolute inset-0"
            colors={[`${tokens.accent}38`, "#ffffff00", "#8bd5ff24", "#ffffff10"]}
            locations={[0, 0.36, 0.72, 1]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </>
      ) : null}
      {isMiuix ? (
        <LinearGradient
          pointerEvents="none"
          className="absolute inset-0"
          colors={tokens.isLight ? ["#f7f7f8", "#f1f2f4"] : [tokens.background, tokens.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      ) : null}
      {children}
    </View>
  );
}