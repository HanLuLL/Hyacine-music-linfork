import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAudio } from "@/hooks/useAudio";
import { DEMO_TRACK } from "@/constants/config";
import { useI18n } from "@/i18n";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { useTheme } from "@/theme";

export default function HomeScreen(): React.JSX.Element {
  const { playTrack } = useAudio();
  const { t } = useI18n();
  const { tokens } = useTheme();

  return <ThemedScreen>
    <ScrollView contentContainerClassName="px-5 pb-40 pt-16">
      <View className="flex-row items-start justify-between">
        <View><Text style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{t("greeting")}</Text><Text className="mt-2 text-sm" style={{ color: tokens.mutedText }}>{t("subtitle")}</Text></View>
        <LiquidControlSurface className="h-11 w-11 items-center justify-center rounded-full"><Text style={{ color: tokens.text, fontSize: 17, fontWeight: "800" }}>H</Text></LiquidControlSurface>
      </View>

      <View className="relative mt-11 h-[338px] overflow-hidden" style={{ backgroundColor: `${tokens.accent}12`, borderRadius: 28 }}>
        <View className="absolute right-[-20px] top-2 h-[230px] w-[218px]">
          <Image className="absolute h-[178px] w-[142px] rounded-[22px]" source={{ uri: DEMO_TRACK.artwork }} contentFit="cover" style={{ left: 53, top: 7, opacity: 0.34, transform: [{ rotate: "13deg" }] }} />
          <Image className="absolute h-[190px] w-[152px] rounded-[24px]" source={{ uri: DEMO_TRACK.artwork }} contentFit="cover" style={{ left: 23, top: 13, opacity: 0.64, transform: [{ rotate: "6deg" }] }} />
          <View className="absolute h-[202px] w-[162px] overflow-hidden rounded-[26px]" style={{ left: 0, top: 18, shadowColor: "#17212d", shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 7, transform: [{ rotate: "-3deg" }] }}><Image className="h-full w-full" source={{ uri: DEMO_TRACK.artwork }} contentFit="cover" /></View>
        </View>
        <View className="absolute left-6 right-6 bottom-6">
          <Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.accent }}>{t("featured")}</Text>
          <Text className="mt-3 pr-28 text-3xl font-bold" numberOfLines={2} style={{ color: tokens.text }}>{DEMO_TRACK.title}</Text>
          <Text className="mt-1 pr-24 text-base" numberOfLines={1} style={{ color: tokens.mutedText }}>{DEMO_TRACK.artist}</Text>
          <LiquidControlSurface className="mt-5 h-12 self-start rounded-full px-5" style={{ borderRadius: 24 }}><Pressable className="h-full flex-row items-center justify-center" onPress={() => void playTrack(DEMO_TRACK)}><Text style={{ color: tokens.text, fontWeight: "800" }}>▶  {t("playDemo")}</Text></Pressable></LiquidControlSurface>
        </View>
      </View>

      <View className="mt-10 flex-row items-center justify-between"><Text style={{ color: tokens.text, fontSize: 21, fontWeight: "800" }}>{t("recentlyPlayed")}</Text><Text className="text-xs font-semibold" style={{ color: tokens.accent }}>01</Text></View>
      <Pressable className="mt-4 flex-row items-center py-2" onPress={() => void playTrack(DEMO_TRACK)}>
        <Image className="h-16 w-16 rounded-2xl" style={{ backgroundColor: `${tokens.text}15` }} source={{ uri: DEMO_TRACK.artwork }} />
        <View className="ml-4 flex-1"><Text className="font-semibold" style={{ color: tokens.text }}>{DEMO_TRACK.title}</Text><Text className="mt-1 text-sm" style={{ color: tokens.mutedText }}>{DEMO_TRACK.artist}</Text></View>
        <LiquidControlSurface className="h-10 w-10 items-center justify-center rounded-full"><Text style={{ color: tokens.text, fontSize: 16 }}>▶</Text></LiquidControlSurface>
      </Pressable>
      <View className="mt-3 h-px" style={{ backgroundColor: tokens.surfaceBorder }} />
      <Text className="mt-5 text-sm leading-6" style={{ color: tokens.mutedText }}>{t("historyHint")}</Text>
    </ScrollView>
  </ThemedScreen>;
}