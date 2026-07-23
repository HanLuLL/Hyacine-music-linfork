// 真液态玻璃视图（backdrop 库 + PixelCopy + Compose）
// 与 expo-liquid-glass（RenderEffect 模糊自身）不同：
// 本模块通过 PixelCopy 捕获 View 在窗口中所处位置的下方像素，
// 交给 backdrop 库应用 blur + lens + vibrancy 效果链，实现真玻璃折射。
// 仅 Android 平台渲染原生 View；其他平台返回普通 View 作为降级。

import { Platform, PixelRatio, View, type ViewProps } from "react-native";

export interface GlassBackdropProps extends ViewProps {
  /** 模糊半径（dp，内部转 px），默认 12 */
  blurRadius?: number;
  /** 圆角半径（dp，内部转 px），默认 28 */
  cornerRadius?: number;
  /** lens 折射高度（dp，内部转 px），默认 6。仅 API 33+ 生效 */
  lensHeight?: number;
  /** 是否启用 lens 折射，默认 true */
  lensEnabled?: boolean;
  /** 玻璃 tint 色，rgba(...) 格式，默认 rgba(255,255,255,0.18) */
  tintColor?: string;
  /** 是否显示顶部高光线，默认 true */
  highlightEnabled?: boolean;
}

let NativeGlassBackdrop: any = null;
try {
  if (Platform.OS === "android") {
    const { requireNativeViewManager } = require("expo-modules-core") as {
      requireNativeViewManager: (name: string) => any;
    };
    NativeGlassBackdrop = requireNativeViewManager("ExpoGlassBackdrop");
  }
} catch {
  NativeGlassBackdrop = null;
}

const dpToPx = (dp: number): number => PixelRatio.getPixelSizeForLayoutSize(dp);

/**
 * 渲染真液态玻璃容器。
 *
 * 平台行为：
 * - Android 12+：backdrop 库 + PixelCopy 真玻璃（blur + lens + vibrancy）
 * - Android 13+：额外启用 lens 折射
 * - Android < 12 或 PixelCopy 连续失败：降级到半透明实色
 * - iOS / 其他平台：返回普通 View（透传 style 与子节点）
 *
 * 注意：本组件会持续进行 30fps 的 PixelCopy 捕获，建议仅在需要玻璃效果的
 * 关键控件（TabBar、MiniPlayer、Card）上使用，避免大量实例造成性能问题。
 */
export function GlassBackdrop(props: GlassBackdropProps): React.ReactElement {
  const {
    blurRadius = 12,
    cornerRadius = 28,
    lensHeight = 6,
    lensEnabled = true,
    tintColor = "rgba(255,255,255,0.18)",
    highlightEnabled = true,
    style,
    children,
    ...rest
  } = props;

  if (NativeGlassBackdrop) {
    return (
      <NativeGlassBackdrop
        blurRadius={dpToPx(blurRadius)}
        cornerRadius={dpToPx(cornerRadius)}
        lensHeight={dpToPx(lensHeight)}
        lensEnabled={lensEnabled}
        tintColor={tintColor}
        highlightEnabled={highlightEnabled}
        style={style}
        {...rest}
      >
        {children}
      </NativeGlassBackdrop>
    );
  }

  // 降级：纯 RN 模拟（iOS / 不支持的 Android）
  return (
    <View
      style={[
        {
          backgroundColor: tintColor,
          borderRadius: cornerRadius,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.55)",
          overflow: "hidden",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
