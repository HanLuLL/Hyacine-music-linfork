import { Platform, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme";
import { LiquidGlassView } from "../../../modules/expo-liquid-glass/src";

interface LiquidControlSurfaceProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  /** 圆角；默认与全局 tokens 保持一致。 */
  cornerRadius?: number;
}

/**
 * 液态玻璃控制容器。
 *
 * 平台策略：
 * - Android + liquid 模式：使用原生 expo-liquid-glass（RenderEffect 真模糊 + Apple 风格高光/边框）
 * - iOS + liquid 模式：使用 expo-blur 的 BlurView（系统级高斯模糊）
 * - 非 liquid 模式：普通 surface
 *
 * 不再使用半透明盒子模拟 —— Android 12+ 设备会得到与 iOS 一致的玻璃质感。
 */
export function LiquidControlSurface({
  children,
  className = "",
  style,
  cornerRadius,
  ...props
}: LiquidControlSurfaceProps): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const liquid = preferences.uiStyle === "liquid";
  const radius = cornerRadius ?? 28;

  if (!liquid) {
    return (
      <View
        className={`overflow-hidden border ${className}`}
        style={[
          {
            backgroundColor: tokens.surfaceStrong,
            borderColor: tokens.surfaceBorder,
            elevation: 0,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS：系统 BlurView
  if (Platform.OS === "ios") {
    return (
      <View
        className={`overflow-hidden border ${className}`}
        style={[
          {
            backgroundColor: "transparent",
            borderColor: "#ffffff8c",
            shadowColor: "#24364f",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            borderRadius: radius,
          },
          style,
        ]}
        {...props}
      >
        <BlurView
          pointerEvents="none"
          intensity={28}
          tint={tokens.isLight ? "light" : "dark"}
          className="absolute inset-0"
          style={{ backgroundColor: "transparent" }}
        />
        <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-px" style={{ backgroundColor: "#ffffffaa" }} />
        {children}
      </View>
    );
  }

  // Android：原生 LiquidGlassView
  const darkMode = !tokens.isLight;
  return (
    <LiquidGlassView
      blurRadius={28}
      saturation={1.18}
      brightness={darkMode ? 0.97 : 1.05}
      cornerRadius={radius}
      tintColor={darkMode ? "rgba(20,22,28,0.32)" : "rgba(255,255,255,0.22)"}
      borderColor={darkMode ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)"}
      showHighlight
      style={[{ overflow: "hidden", borderRadius: radius }, style]}
      {...props}
    >
      {children}
    </LiquidGlassView>
  );
}
