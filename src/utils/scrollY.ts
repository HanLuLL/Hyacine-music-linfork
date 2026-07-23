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

/** 切换 tab 或页面挂载时调用，重置滚动渐隐的起点。 */
export function resetScrollY(): void {
  globalScrollY.setValue(0);
}
