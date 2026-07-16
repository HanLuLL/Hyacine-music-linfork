import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAudio } from "@/hooks/useAudio";
import { DEMO_TRACK } from "@/constants/config";
import { useI18n } from "@/i18n";

export default function HomeScreen(): React.JSX.Element {
  const { playTrack } = useAudio();
  const { t } = useI18n();

  return (
    <ScrollView className="flex-1 bg-[#09090b]" contentContainerClassName="px-5 pb-10 pt-16">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-bold tracking-tight text-white">{t("greeting")}</Text>
          <Text className="mt-2 text-sm text-zinc-400">{t("subtitle")}</Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full border border-lime-300/30 bg-lime-300/10">
          <Text className="text-lg font-bold text-lime-300">H</Text>
        </View>
      </View>

      <View className="mt-9 overflow-hidden rounded-3xl border border-lime-200/10 bg-[#171a13]">
        <View className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-lime-300/15" />
        <View className="p-6">
          <Text className="text-xs font-bold tracking-[2px] text-lime-300">{t("featured")}</Text>
          <Text className="mt-5 text-2xl font-bold text-white">{DEMO_TRACK.title}</Text>
          <Text className="mt-1 text-base text-zinc-400">{DEMO_TRACK.artist}</Text>
          <Pressable
            className="mt-7 self-start rounded-full bg-lime-300 px-5 py-3"
            onPress={() => void playTrack(DEMO_TRACK)}
          >
            <Text className="font-bold text-[#171a13]">▶  {t("playDemo")}</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-9 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">{t("recentlyPlayed")}</Text>
        <Text className="text-xs font-semibold text-lime-300">01</Text>
      </View>
      <View className="mt-4 flex-row rounded-2xl border border-zinc-800 bg-[#121214] p-3">
        <Image className="h-16 w-16 rounded-xl bg-zinc-800" source={{ uri: DEMO_TRACK.artwork }} />
        <View className="ml-4 flex-1 justify-center">
          <Text className="font-semibold text-white">{DEMO_TRACK.title}</Text>
          <Text className="mt-1 text-sm text-zinc-500">{DEMO_TRACK.artist}</Text>
        </View>
        <Pressable className="items-center justify-center px-2" onPress={() => void playTrack(DEMO_TRACK)}>
          <Text className="text-xl text-lime-300">▶</Text>
        </Pressable>
      </View>
      <Text className="mt-5 text-sm leading-6 text-zinc-500">{t("historyHint")}</Text>
    </ScrollView>
  );
}