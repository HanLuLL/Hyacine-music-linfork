import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { useI18n } from "@/i18n";
import { TrackCover } from "@/components/TrackCover";
import { usePlayerStore } from "@/store/playerStore";
import { useTheme } from "@/theme";

export function MiniPlayer(): React.JSX.Element | null {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { togglePlayback } = useAudio();
  const { t } = useI18n();
  const { tokens } = useTheme();

  if (!track) return null;

  return (
    <View
      className="absolute bottom-[62px] left-0 right-0 z-20 flex-row items-center border-t px-4 py-2"
      style={{ backgroundColor: tokens.surfaceStrong, borderTopColor: tokens.surfaceBorder }}
    >
      <Pressable className="min-w-0 flex-1 flex-row items-center gap-3" onPress={() => router.push(`/player/${track.id}`)}>
        <TrackCover uri={track.artwork} title={track.title} size={42} radius={8} />
        <View className="min-w-0 flex-1">
          <Text className="truncate text-sm font-semibold" style={{ color: tokens.text }}>{track.title}</Text>
          <Text className="truncate text-xs" style={{ color: tokens.mutedText }}>{track.artist}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={isPlaying ? t("pause") : t("play")}
        className="ml-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${tokens.accent}20` }}
        onPress={() => void togglePlayback()}
      >
        <Text style={{ color: tokens.accent, fontSize: 16, fontWeight: "800" }}>{isPlaying ? "Ⅱ" : "▶"}</Text>
      </Pressable>
    </View>
  );
}