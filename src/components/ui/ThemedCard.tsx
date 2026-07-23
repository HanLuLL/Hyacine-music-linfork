import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 通用主题卡片。
 *
 * 平台策略：
 * - liquid + iOS：BlurView（系统模糊）
 * - liquid + Android：半透明实色背景模拟玻璃质感（RenderEffect 无法模糊 View 下方内容）
 * - miuix：圆角阴影 + 半透明背景（保留原 MIUI 风格）
 * - native：实色 surface
 */
export function ThemedCard({ children, className = "", style, ...props }: ThemedCardProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const isMiuix = preferences.uiStyle === "miuix";
  const isLiquid = preferences.uiStyle === "liquid";
  const radius = tokens.cardRadius;

  // 非 liquid 模式
  if (!isLiquid) {
    return (
      <View
        className={`overflow-hidden border p-5 ${className}`}
        style={[
          {
            backgroundColor: isMiuix ? `${tokens.surface}F2` : tokens.surface,
            borderColor: tokens.surfaceBorder,
            borderRadius: radius,
            shadowColor: "#000000",
            shadowOpacity: isMiuix ? 0.07 : 0,
            shadowRadius: isMiuix ? 10 : 0,
            shadowOffset: { width: 0, height: 4 },
            elevation: isMiuix ? 2 : 0,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS liquid
  if (Platform.OS === "ios") {
    return (
      <View
        className={`overflow-hidden border p-5 ${className}`}
        style={[
          {
            backgroundColor: "transparent",
            borderColor: "#ffffff8c",
            borderRadius: radius,
            shadowColor: "#31415f",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          },
          style,
        ]}
        {...props}
      >
        <BlurView
          pointerEvents="none"
          className="absolute inset-0"
          intensity={48}
          tint={tokens.isLight ? "light" : "dark"}
          style={{ backgroundColor: "transparent" }}
        />
        <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffff88" }} />
        {children}
      </View>
    );
  }

  // Android liquid：半透明实色背景模拟玻璃质感
  // （Android RenderEffect 无法模糊 View 下方内容，改用实色模拟，与 LiquidControlSurface 保持一致）
  const darkMode = !tokens.isLight;
  return (
    <View
      className={`overflow-hidden border p-5 ${className}`}
      style={[
        {
          backgroundColor: darkMode ? "rgba(28,30,38,0.72)" : "rgba(248,250,252,0.72)",
          borderColor: darkMode ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)",
          borderRadius: radius,
          shadowColor: "#24364f",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.88)" }} />
      {children}
    </View>
  );
}
