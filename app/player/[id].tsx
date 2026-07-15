import { Pressable, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import TrackPlayer from "react-native-track-player";
import { useAudio } from "@/hooks/useAudio";
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
  const { togglePlayback } = useAudio();
  const width: DimensionValue =
    duration > 0 ? `${Math.min((progress / duration) * 100, 100)}%` : "0%";

  if (!track) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950 px-5">
        <Text className="text-lg font-bold text-white">Nothing is playing</Text>
        <Pressable className="mt-6 rounded bg-lime-300 px-4 py-3" onPress={() => router.back()}>
          <Text className="font-bold text-zinc-950">Back to library</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pb-10 pt-16">
      <Pressable onPress={() => router.back()}>
        <Text className="text-sm font-semibold text-lime-300">Close player</Text>
      </Pressable>
      {track.artwork ? (
        <Image className="mt-10 aspect-square w-full rounded-lg bg-zinc-900" source={{ uri: track.artwork }} />
      ) : (
        <View className="mt-10 aspect-square w-full rounded-lg bg-zinc-900" />
      )}
      <Text className="mt-8 text-2xl font-bold text-white">{track.title}</Text>
      <Text className="mt-2 text-base text-zinc-400">{track.artist}</Text>

      <View className="mt-10 h-1 overflow-hidden rounded bg-zinc-800">
        <View className="h-full bg-lime-300" style={{ width }} />
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-zinc-500">{formatDuration(progress)}</Text>
        <Text className="text-xs text-zinc-500">{formatDuration(duration)}</Text>
      </View>

      <View className="mt-10 flex-row items-center justify-center gap-8">
        <Pressable className="p-3" onPress={() => void TrackPlayer.seekBy(-15)}>
          <Text className="text-base font-semibold text-white">-15</Text>
        </Pressable>
        <Pressable
          className="h-16 w-16 items-center justify-center rounded-full bg-lime-300"
          onPress={() => void togglePlayback()}
        >
          <Text className="text-xl font-bold text-zinc-950">{isPlaying ? "II" : ">"}</Text>
        </Pressable>
        <Pressable className="p-3" onPress={() => void TrackPlayer.seekBy(15)}>
          <Text className="text-base font-semibold text-white">+15</Text>
        </Pressable>
      </View>
    </View>
  );
}