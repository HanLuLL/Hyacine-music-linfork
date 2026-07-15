import { Pressable, ScrollView, Text, View } from "react-native";
import { useAudio } from "@/hooks/useAudio";
import { DEMO_TRACK } from "@/constants/config";

export default function HomeScreen(): React.JSX.Element {
  const { playTrack } = useAudio();

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-5 pb-12 pt-16">
      <Text className="text-3xl font-bold text-white">Good evening</Text>
      <Text className="mt-2 text-sm text-zinc-400">Your music, without interruption.</Text>

      <View className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <Text className="text-xs font-semibold uppercase text-lime-300">Development build</Text>
        <Text className="mt-2 text-xl font-bold text-white">{DEMO_TRACK.title}</Text>
        <Text className="mt-1 text-sm text-zinc-400">{DEMO_TRACK.artist}</Text>
        <Pressable
          className="mt-5 items-center rounded bg-lime-300 px-4 py-3"
          onPress={() => void playTrack(DEMO_TRACK)}
        >
          <Text className="font-bold text-zinc-950">Play demo track</Text>
        </Pressable>
      </View>

      <Text className="mt-10 text-lg font-bold text-white">Recently played</Text>
      <Text className="mt-3 text-sm leading-6 text-zinc-400">
        Connect the NestJS API through EXPO_PUBLIC_API_URL to load listening history,
        recommendations, and cloud playlists.
      </Text>
    </ScrollView>
  );
}