import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme";

export function MiniPlayer(): React.JSX.Element | null {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { togglePlayback } = useAudio();
  const { t } = useI18n();
  const { preferences, tokens } = useTheme();

  if (!track) return null;

  return (
    <View
      className="border-t px-4 py-3"
      style={{
        backgroundColor: preferences.uiStyle === "miui" ? tokens.surfaceStrong : `${tokens.surfaceStrong}f2`,
        borderColor: tokens.surfaceBorder,
        shadowColor: "#000000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
      }}
    >
      <View className="absolute left-0 right-0 top-0 h-0.5" style={{ backgroundColor: tokens.accent }} />
      <View className="flex-row items-center gap-3">
        <Pressable className="min-w-0 flex-1 flex-row items-center gap-3" onPress={() => router.push(`/player/${track.id}`)}>
          {track.artwork ? (
            <Image className="h-12 w-12" style={{ borderRadius: tokens.cardRadius - 6 }} source={{ uri: track.artwork }} />
          ) : (
            <View className="h-12 w-12" style={{ borderRadius: tokens.cardRadius - 6, backgroundColor: tokens.accent }} />
          )}
          <View className="min-w-0 flex-1">
            <Text className="truncate text-sm font-semibold" style={{ color: tokens.text }}>{track.title}</Text>
            <Text className="truncate text-xs" style={{ color: tokens.mutedText }}>{t("miniPlayer")} · {track.artist}</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? t("pause") : t("play")}
          className="h-10 w-10 items-center justify-center"
          style={{ borderRadius: 20, backgroundColor: tokens.accent }}
          onPress={() => void togglePlayback()}
        >
          <Text className="text-base font-bold text-black">{isPlaying ? "Ⅱ" : "▶"}</Text>
        </Pressable>
      </View>
    </View>
  );
}