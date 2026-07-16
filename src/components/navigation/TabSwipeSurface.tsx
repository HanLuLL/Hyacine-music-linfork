import { type PropsWithChildren, useMemo } from "react";
import { usePathname, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { View } from "react-native";

const routes = ["/(tabs)", "/(tabs)/search", "/(tabs)/library", "/(tabs)/profile"] as const;

function routeIndex(pathname: string): number {
  if (pathname.includes("/search")) return 1;
  if (pathname.includes("/library")) return 2;
  if (pathname.includes("/profile")) return 3;
  return 0;
}

export function TabSwipeSurface({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const index = routeIndex(pathname);
  const gesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-24, 24])
    .runOnJS(true)
    .onEnd((event) => {
      if (Math.abs(event.translationX) < 54 && Math.abs(event.velocityX) < 460) return;
      const next = Math.max(0, Math.min(routes.length - 1, index + (event.translationX < 0 ? 1 : -1)));
      if (next !== index) router.replace(routes[next]);
    }), [index, router]);

  return <GestureDetector gesture={gesture}><View className="flex-1">{children}</View></GestureDetector>;
}