import { Pressable, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { useI18n } from "@/i18n";
import { usePlayerStore } from "@/store/playerStore";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

function formatDuration(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface PlayerControlsProps {
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onToggle: () => void;
}

function PlayerControls({ isPlaying, onSeek, onToggle }: PlayerControlsProps): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();

  return (
    <View className="mt-9 flex-row items-center justify-center gap-8">
      <Pressable accessibilityLabel={t("previous15")} className="h-12 w-12 items-center justify-center" onPress={() => onSeek(-15)}>
        <Text style={{ color: tokens.text, fontSize: 15, fontWeight: "800" }}>−15</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={isPlaying ? t("pause") : t("play")}
        className="h-[72px] w-[72px] items-center justify-center"
        style={{ borderRadius: 36, backgroundColor: tokens.accent }}
        onPress={onToggle}
      >
        <Text style={{ color: "#111111", fontSize: 24, fontWeight: "900" }}>{isPlaying ? "Ⅱ" : "▶"}</Text>
      </Pressable>
      <Pressable accessibilityLabel={t("next15")} className="h-12 w-12 items-center justify-center" onPress={() => onSeek(15)}>
        <Text style={{ color: tokens.text, fontSize: 15, fontWeight: "800" }}>+15</Text>
      </Pressable>
    </View>
  );
}

interface ProgressProps {
  progress: number;
  duration: number;
  width: DimensionValue;
}

function Progress({ progress, duration, width }: ProgressProps): React.JSX.Element {
  const { tokens } = useTheme();

  return (
    <>
      <View className="mt-9 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.text}22` }}>
        <View className="h-full rounded-full" style={{ width, backgroundColor: tokens.accent }} />
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs" style={{ color: tokens.mutedText }}>{formatDuration(progress)}</Text>
        <Text className="text-xs" style={{ color: tokens.mutedText }}>{formatDuration(duration)}</Text>
      </View>
    </>
  );
}

export default function FullPlayerScreen(): React.JSX.Element {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const { seekBy, togglePlayback } = useAudio();
  const { t } = useI18n();
  const { preferences, tokens } = useTheme();
  const width: DimensionValue = duration > 0 ? `${Math.min((progress / duration) * 100, 100)}%` : "0%";

  if (!track) {
    return (
      <ThemedScreen className="items-center justify-center px-6">
        <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}22` }}>
          <Text style={{ color: tokens.accent, fontSize: 38 }}>♫</Text>
        </View>
        <Text className="mt-6 text-xl font-bold" style={{ color: tokens.text }}>{t("nothingPlaying")}</Text>
        <Pressable className="mt-6 px-5 py-3" style={{ borderRadius: tokens.pillRadius, backgroundColor: tokens.accent }} onPress={() => router.back()}>
          <Text className="font-bold text-black">{t("backToHome")}</Text>
        </Pressable>
      </ThemedScreen>
    );
  }

  const controls = <PlayerControls isPlaying={isPlaying} onSeek={(seconds) => void seekBy(seconds)} onToggle={() => void togglePlayback()} />;
  const progressBar = <Progress progress={progress} duration={duration} width={width} />;

  return (
    <ThemedScreen>
      {preferences.playerLayout === "immersive" && track.artwork ? (
        <Image
          pointerEvents="none"
          className="absolute inset-0 h-full w-full opacity-20"
          contentFit="cover"
          source={{ uri: track.artwork }}
        />
      ) : null}

      <View className="flex-1 px-6 pb-10 pt-16">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={{ color: tokens.accent, fontSize: 14, fontWeight: "800" }}>⌄  {t("closePlayer")}</Text>
          </Pressable>
          <Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("nowPlaying")}</Text>
        </View>

        {preferences.playerLayout === "vinyl" ? (
          <>
            <View className="mt-12 aspect-square w-full items-center justify-center rounded-full border-8" style={{ borderColor: "#0b0b0e", backgroundColor: "#18181c" }}>
              <View className="absolute h-[84%] w-[84%] rounded-full border" style={{ borderColor: `${tokens.text}20` }} />
              <View className="absolute h-[58%] w-[58%] rounded-full border" style={{ borderColor: `${tokens.text}15` }} />
              {track.artwork ? <Image className="h-[66%] w-[66%] rounded-full" source={{ uri: track.artwork }} /> : null}
              <View className="absolute h-7 w-7 rounded-full border-4" style={{ backgroundColor: tokens.accent, borderColor: "#161616" }} />
            </View>
            <View className="mt-9 flex-row items-end justify-between">
              <View className="min-w-0 flex-1 pr-5">
                <Text numberOfLines={1} style={{ color: tokens.text, fontSize: 24, fontWeight: "800" }}>{track.title}</Text>
                <Text className="mt-2 text-base" numberOfLines={1} style={{ color: tokens.mutedText }}>{track.artist}</Text>
              </View>
              <Text style={{ color: tokens.accent, fontSize: 22 }}>♡</Text>
            </View>
            {progressBar}
            {controls}
          </>
        ) : null}

        {preferences.playerLayout === "immersive" ? (
          <>
            <View className="mt-12 items-center">
              {track.artwork ? (
                <View className="overflow-hidden border p-2" style={{ borderRadius: tokens.cardRadius + 8, borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }}>
                  <Image className="h-64 w-64 rounded-2xl" source={{ uri: track.artwork }} />
                </View>
              ) : null}
            </View>
            <View className="mt-10 rounded-3xl border p-5" style={{ backgroundColor: tokens.surfaceStrong, borderColor: tokens.surfaceBorder, borderRadius: tokens.cardRadius }}>
              <Text numberOfLines={1} style={{ color: tokens.text, fontSize: 25, fontWeight: "800" }}>{track.title}</Text>
              <Text className="mt-2 text-base" numberOfLines={1} style={{ color: tokens.mutedText }}>{track.artist}</Text>
              {progressBar}
              {controls}
            </View>
          </>
        ) : null}

        {preferences.playerLayout === "minimal" ? (
          <View className="flex-1 justify-center">
            <Text className="text-xs font-bold tracking-[3px]" style={{ color: tokens.accent }}>HYACINE / PLAYING</Text>
            <Text className="mt-6 text-5xl font-black leading-[56px]" numberOfLines={2} style={{ color: tokens.text }}>{track.title}</Text>
            <Text className="mt-4 text-xl" numberOfLines={1} style={{ color: tokens.mutedText }}>{track.artist}</Text>
            <View className="mt-16 flex-row items-end justify-between px-1">
              {[18, 34, 25, 46, 32, 56, 39, 24, 49, 30, 42, 20].map((height, index) => (
                <View key={`${height}-${index}`} className="w-1.5 rounded-full" style={{ height, backgroundColor: index % 3 === 0 ? tokens.accent : `${tokens.text}55` }} />
              ))}
            </View>
            <View className="mt-12 h-3 overflow-hidden rounded-full" style={{ backgroundColor: `${tokens.text}22` }}>
              <View className="h-full rounded-full" style={{ width, backgroundColor: tokens.accent }} />
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-xs" style={{ color: tokens.mutedText }}>{formatDuration(progress)}</Text>
              <Text className="text-xs" style={{ color: tokens.mutedText }}>{formatDuration(duration)}</Text>
            </View>
            {controls}
          </View>
        ) : null}
      </View>
    </ThemedScreen>
  );
}