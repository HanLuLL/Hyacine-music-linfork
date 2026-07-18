import { type PropsWithChildren, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Dimensions, StyleSheet, View } from "react-native";

const routes = ["/(tabs)", "/(tabs)/search", "/(tabs)/library", "/(tabs)/profile"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;

function routeIndex(pathname: string): number {
  if (pathname.includes("/search")) return 1;
  if (pathname.includes("/library")) return 2;
  if (pathname.includes("/profile")) return 3;
  return 0;
}

function switchTab(router: ReturnType<typeof useRouter>, next: number, current: number): void {
  if (next === current) return;
  router.replace(routes[next]);
}

export function TabSwipeSurface({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const index = routeIndex(pathname);
  const dragX = useSharedValue(0);
  const isDragging = useSharedValue(0);

  useEffect(() => {
    dragX.value = 0;
    isDragging.value = 0;
  }, [dragX, index, isDragging]);

  const goTo = useMemo(
    () => (next: number) => {
      switchTab(router, next, index);
    },
    [index, router],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-16, 16])
        .failOffsetY([-20, 20])
        .onBegin(() => {
          isDragging.value = 1;
        })
        .onUpdate((event) => {
          const atStart = index <= 0 && event.translationX > 0;
          const atEnd = index >= routes.length - 1 && event.translationX < 0;
          const resistance = atStart || atEnd ? 0.28 : 1;
          dragX.value = event.translationX * resistance;
        })
        .onEnd((event) => {
          const shouldSwitch =
            Math.abs(event.translationX) > SCREEN_WIDTH * 0.18 || Math.abs(event.velocityX) > 680;
          if (!shouldSwitch) {
            dragX.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.7 });
            isDragging.value = 0;
            return;
          }

          const direction = event.translationX < 0 ? 1 : -1;
          const next = Math.max(0, Math.min(routes.length - 1, index + direction));
          if (next === index) {
            dragX.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.7 });
            isDragging.value = 0;
            return;
          }

          const target = direction < 0 ? SCREEN_WIDTH * 0.18 : -SCREEN_WIDTH * 0.18;
          // Mark drag complete so onFinalize won't snap the page back mid-transition.
          isDragging.value = 0;
          dragX.value = withSpring(target, { damping: 24, stiffness: 280, mass: 0.65 }, (finished) => {
            if (finished) {
              runOnJS(goTo)(next);
              dragX.value = 0;
            }
          });
        })
        .onFinalize(() => {
          if (isDragging.value === 1) {
            dragX.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.7 });
            isDragging.value = 0;
          }
        }),
    [goTo, index],
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value * 0.42 }],
    opacity: 1 - Math.min(Math.abs(dragX.value) / (SCREEN_WIDTH * 1.8), 0.08),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.root}>
        <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
