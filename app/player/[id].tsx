import { Pressable, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { useI18n } from "@/i18n";
import { usePlayerStore } from "@/store/playerStore";

function formatDuration(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FullPlayerScreen(): React.JSX.Element {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const { seekBy, togglePlayback } = useAudio();
  const { t } = useI18n();
  const width: DimensionValue =
    duration > 0 ? `${Math.min((progress / duration) * 100, 100)}%` : "0%";

  if (!track) {
    return (
      <View className="flex-1 items-center justify-center bg-[#09090b] px-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-lime-300/10">
          <Text className="text-4xl text-lime-300">♫</Text>
        </View>
        <Text className="mt-6 text-xl font-bold text-white">{t("nothingPlaying")}</Text>
        <Pressable className="mt-6 rounded-full bg-lime-300 px-5 py-3" onPress={() => router.back()}>
          <Text className="font-bold text-[#171a13]">{t("backToHome")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#09090b] px-6 pb-10 pt-16">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm font-semibold text-lime-300">⌄  {t("closePlayer")}</Text>
        </Pressable>
        <Text className="text-xs font-bold tracking-[2px] text-zinc-500">{t("nowPlaying")}</Text>
      </View>

      {track.artwork ? (
        <Image className="mt-10 aspect-square w-full rounded-3xl bg-zinc-900" source={{ uri: track.artwork }} />
      ) : (
        <View className="mt-10 aspect-square w-full rounded-3xl bg-[#171a13]" />
      )}

      <View className="mt-8 flex-row items-end justify-between">
        <View className="min-w-0 flex-1 pr-5">
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>{track.title}</Text>
          <Text className="mt-2 text-base text-zinc-500" numberOfLines={1}>{track.artist}</Text>
        </View>
        <Text className="text-xl text-lime-300">♡</Text>
      </View>

      <View className="mt-10 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <View className="h-full rounded-full bg-lime-300" style={{ width }} />
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-zinc-500">{formatDuration(progress)}</Text>
        <Text className="text-xs text-zinc-500">{formatDuration(duration)}</Text>
      </View>

      <View className="mt-10 flex-row items-center justify-center gap-8">
        <Pressable
          accessibilityLabel={t("previous15")}
          className="h-12 w-12 items-center justify-center"
          onPress={() => void seekBy(-15)}
        >
          <Text className="text-sm font-bold text-zinc-300">−15</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? t("pause") : t("play")}
          className="h-[72px] w-[72px] items-center justify-center rounded-full bg-lime-300"
          onPress={() => void togglePlayback()}
        >
          <Text className="text-2xl font-bold text-[#171a13]">{isPlaying ? "Ⅱ" : "▶"}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t("next15")}
          className="h-12 w-12 items-center justify-center"
          onPress={() => void seekBy(15)}
        >
          <Text className="text-sm font-bold text-zinc-300">+15</Text>
        </Pressable>
      </View>
    </View>
  );
}