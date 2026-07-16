import { View, type ViewProps } from "react-native";
import { useTheme } from "@/theme";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedCard({ children, className = "", style, ...props }: ThemedCardProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();

  return (
    <View
      className={`overflow-hidden border p-5 ${className}`}
      style={[
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.surfaceBorder,
          borderRadius: tokens.cardRadius,
          shadowColor: preferences.uiStyle === "miui" ? "#000000" : tokens.accent,
          shadowOpacity: preferences.uiStyle === "miui" ? 0.2 : 0.08,
          shadowRadius: preferences.uiStyle === "miui" ? 16 : 10,
          shadowOffset: { width: 0, height: 8 },
          elevation: preferences.uiStyle === "miui" ? 8 : 2,
        },
        style,
      ]}
      {...props}
    >
      {preferences.uiStyle === "liquid" ? (
        <View
          pointerEvents="none"
          className="absolute -left-10 -top-14 h-28 w-56 rounded-full"
          style={{ backgroundColor: "#ffffff22" }}
        />
      ) : null}
      {children}
    </View>
  );
}