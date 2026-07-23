import { Animated } from "react-native";

/**
 * 全局滚动 Y 值，用于 Tab 栏和 MiniPlayer 的滑动渐隐插值。
 *
 * 各 tab 页面（index/search/library/profile）的 Animated.ScrollView
 * 通过 onScroll 更新此值；TabBar 和 MiniPlayer 监听此值插值 opacity/translateY。
 *
 * 切换 tab 时需调用 resetScrollY() 重置，避免上一个页面的滚动位置影响新页面。
 */
export const globalScrollY = new Animated.Value(0);

/**
 * 滑动渐隐动画值：1=可见, 0=隐藏。
 *
 * 行为：滑动开始时渐隐（→0），滑动停止后渐显（→1）。
 * 由 notifyScrollBegin / notifyScrollEnd 驱动，各 tab 页面的滚动回调调用这两个函数。
 */
export const fadeAnim = new Animated.Value(1);

let hideTimer: ReturnType<typeof setTimeout> | null = null;

/** 滑动开始时调用：立即渐隐 TabBar 和 MiniPlayer。 */
export function notifyScrollBegin(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  }).start();
}

/**
 * 滑动停止时调用：延迟渐显 TabBar 和 MiniPlayer。
 *
 * 延迟 150ms 以兼容惯性滚动——onScrollEndDrag 触发后惯性可能仍在继续，
 * onMomentumScrollEnd 会再次调用本函数重置计时器，避免提前渐显。
 */
export function notifyScrollEnd(): void {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    hideTimer = null;
  }, 150);
}

/** 切换 tab 或页面挂载时调用，重置滚动渐隐的起点。 */
export function resetScrollY(): void {
  globalScrollY.setValue(0);
  fadeAnim.setValue(1);
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}
