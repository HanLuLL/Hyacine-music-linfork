import { View, type ViewProps } from "react-native";
import { useTheme } from "@/theme";

interface ThemedScreenProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedScreen({ children, className = "", style, ...props }: ThemedScreenProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();

  return (
    <View className={`flex-1 overflow-hidden ${className}`} style={[{ backgroundColor: tokens.background }, style]} {...props}>
      <View
        pointerEvents="none"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{ backgroundColor: `${tokens.accent}${preferences.uiStyle === "liquid" ? "38" : "20"}` }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full"
        style={{ backgroundColor: `${tokens.backgroundSecondary}aa` }}
      />
      {children}
    </View>
  );
}