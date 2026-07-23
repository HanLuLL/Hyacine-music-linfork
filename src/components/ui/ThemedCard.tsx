import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme";
import { LiquidGlassView } from "../../../modules/expo-liquid-glass/src";

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 通用主题卡片。
 *
 * 平台策略：
 * - liquid + iOS：BlurView（系统模糊）
 * - liquid + Android：LiquidGlassView（RenderEffect 模糊 + 高光）
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

  // Android liquid：原生 LiquidGlassView 作为绝对定位背景层，children 放在外层 View 中
  // 避免 RenderEffect 模糊掉子元素
  const dark = !tokens.isLight;
  return (
    <View
      className={`overflow-hidden ${className}`}
      style={[{ borderRadius: radius, padding: 20, position: "relative" as const }, style]}
      {...props}
    >
      <LiquidGlassView
        pointerEvents="none"
        blurRadius={32}
        saturation={1.18}
        brightness={dark ? 0.97 : 1.05}
        cornerRadius={radius}
        tintColor={dark ? "rgba(20,22,28,0.32)" : "rgba(255,255,255,0.22)"}
        borderColor={dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)"}
        showHighlight
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {children}
    </View>
  );
}
