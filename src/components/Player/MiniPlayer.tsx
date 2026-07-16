import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { useTheme } from "@/theme";

export function MiniPlayer(): React.JSX.Element | null {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { togglePlayback } = useAudio();
  const { t } = useI18n();
  const { tokens } = useTheme();
  if (!track) return null;
  return <LiquidControlSurface className="absolute bottom-[100px] left-4 right-4 z-20 flex-row items-center rounded-[26px] px-3 py-2" style={{ borderRadius: 26 }}>
    <Pressable className="min-w-0 flex-1 flex-row items-center gap-3" onPress={() => router.push(`/player/${track.id}`)}>
      {track.artwork ? <Image className="h-11 w-11 rounded-2xl" source={{ uri: track.artwork }} /> : <View className="h-11 w-11 rounded-2xl" style={{ backgroundColor: tokens.accent }} />}
      <View className="min-w-0 flex-1"><Text className="truncate text-sm font-semibold" style={{ color: tokens.text }}>{track.title}</Text><Text className="truncate text-xs" style={{ color: tokens.mutedText }}>{t("miniPlayer")} · {track.artist}</Text></View>
    </Pressable>
    <Pressable accessibilityLabel={isPlaying ? t("pause") : t("play")} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.text}18` }} onPress={() => void togglePlayback()}><Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{isPlaying ? "Ⅱ" : "▶"}</Text></Pressable>
  </LiquidControlSurface>;
}