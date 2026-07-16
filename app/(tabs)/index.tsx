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

      <View className="mt-11 overflow-hidden" style={{ borderRadius: 28, backgroundColor: `${tokens.accent}1c` }}>
        <Image className="absolute inset-0 h-full w-full opacity-25" source={{ uri: DEMO_TRACK.artwork }} contentFit="cover" />
        <View className="min-h-60 justify-end p-6"><Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.accent }}>{t("featured")}</Text><Text className="mt-4 text-3xl font-bold" style={{ color: tokens.text }}>{DEMO_TRACK.title}</Text><Text className="mt-1 text-base" style={{ color: tokens.mutedText }}>{DEMO_TRACK.artist}</Text></View>
        <LiquidControlSurface className="absolute bottom-4 left-5 h-11 flex-row items-center justify-center rounded-full px-5" style={{ borderRadius: 22 }}><Pressable onPress={() => void playTrack(DEMO_TRACK)}><Text style={{ color: tokens.text, fontWeight: "800" }}>▶  {t("playDemo")}</Text></Pressable></LiquidControlSurface>
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