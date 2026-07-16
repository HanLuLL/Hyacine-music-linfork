import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAudio } from "@/hooks/useAudio";
import { DEMO_TRACK } from "@/constants/config";
import { useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

export default function HomeScreen(): React.JSX.Element {
  const { playTrack } = useAudio();
  const { t } = useI18n();
  const { tokens } = useTheme();

  return (
    <ThemedScreen>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-16">
        <View className="flex-row items-start justify-between">
          <View>
            <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "800" }}>{t("greeting")}</Text>
            <Text className="mt-2 text-sm" style={{ color: tokens.mutedText }}>{t("subtitle")}</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full border" style={{ backgroundColor: `${tokens.accent}20`, borderColor: `${tokens.accent}55` }}>
            <Text style={{ color: tokens.accent, fontSize: 18, fontWeight: "800" }}>H</Text>
          </View>
        </View>

        <ThemedCard className="mt-9 p-0">
          <View className="overflow-hidden p-6">
            <View className="absolute -right-12 -top-20 h-52 w-52 rounded-full" style={{ backgroundColor: `${tokens.accent}25` }} />
            <Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.accent }}>{t("featured")}</Text>
            <Text className="mt-5 text-2xl font-bold" style={{ color: tokens.text }}>{DEMO_TRACK.title}</Text>
            <Text className="mt-1 text-base" style={{ color: tokens.mutedText }}>{DEMO_TRACK.artist}</Text>
            <Pressable
              className="mt-7 min-h-11 self-start items-center justify-center px-5 py-3"
              style={{ borderRadius: tokens.pillRadius, backgroundColor: tokens.accent }}
              onPress={() => void playTrack(DEMO_TRACK)}
            >
              <Text className="font-bold text-black">▶  {t("playDemo")}</Text>
            </Pressable>
          </View>
        </ThemedCard>

        <View className="mt-9 flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 20, fontWeight: "800" }}>{t("recentlyPlayed")}</Text>
          <Text className="text-xs font-semibold" style={{ color: tokens.accent }}>01</Text>
        </View>

        <ThemedCard className="mt-4 flex-row p-3">
          <Image className="h-16 w-16 rounded-xl" style={{ backgroundColor: `${tokens.text}15` }} source={{ uri: DEMO_TRACK.artwork }} />
          <View className="ml-4 flex-1 justify-center">
            <Text className="font-semibold" style={{ color: tokens.text }}>{DEMO_TRACK.title}</Text>
            <Text className="mt-1 text-sm" style={{ color: tokens.mutedText }}>{DEMO_TRACK.artist}</Text>
          </View>
          <Pressable className="min-h-11 min-w-11 items-center justify-center" onPress={() => void playTrack(DEMO_TRACK)}>
            <Text style={{ color: tokens.accent, fontSize: 20 }}>▶</Text>
          </Pressable>
        </ThemedCard>
        <Text className="mt-5 text-sm leading-6" style={{ color: tokens.mutedText }}>{t("historyHint")}</Text>
      </ScrollView>
    </ThemedScreen>
  );
}