import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudio } from "@/hooks/useAudio";
import { usePlayerStore } from "@/store/playerStore";

export function MiniPlayer(): React.JSX.Element | null {
  const track = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { togglePlayback } = useAudio();

  if (!track) return null;

  return (
    <View className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
      <View className="flex-row items-center gap-3">
        <Pressable
          className="min-w-0 flex-1 flex-row items-center gap-3"
          onPress={() => router.push(`/player/${track.id}`)}
        >
          {track.artwork ? (
            <Image className="h-12 w-12 rounded" source={{ uri: track.artwork }} />
          ) : (
            <View className="h-12 w-12 rounded bg-lime-300" />
          )}
          <View className="min-w-0 flex-1">
            <Text className="truncate text-sm font-semibold text-white">{track.title}</Text>
            <Text className="truncate text-xs text-zinc-400">{track.artist}</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          className="h-10 w-10 items-center justify-center rounded-full bg-lime-300"
          onPress={() => void togglePlayback()}
        >
          <Text className="text-base font-bold text-zinc-950">{isPlaying ? "II" : ">"}</Text>
        </Pressable>
      </View>
    </View>
  );
}