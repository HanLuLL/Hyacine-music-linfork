import { Pressable, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

export default function LibraryScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();

  async function requestLibraryAccess(): Promise<void> {
    await MediaLibrary.requestPermissionsAsync();
  }

  return (
    <ThemedScreen>
      <View className="flex-1 px-5 pt-16">
        <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "800" }}>{t("library")}</Text>
        <ThemedCard className="mt-8 items-center px-6 py-10">
          <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}20` }}>
            <Text style={{ color: tokens.accent, fontSize: 30 }}>♫</Text>
          </View>
          <Text className="mt-6 text-xl font-bold" style={{ color: tokens.text }}>{t("localTitle")}</Text>
          <Text className="mt-3 text-center text-sm leading-6" style={{ color: tokens.mutedText }}>{t("localHint")}</Text>
          <Pressable
            className="mt-7 min-h-11 items-center justify-center px-5 py-3"
            style={{ borderRadius: tokens.pillRadius, backgroundColor: tokens.accent }}
            onPress={() => void requestLibraryAccess()}
          >
            <Text className="font-bold text-black">{t("allowAudio")}</Text>
          </Pressable>
        </ThemedCard>
        <Text className="mt-5 text-center text-xs" style={{ color: tokens.mutedText }}>{t("permissionNote")}</Text>
      </View>
    </ThemedScreen>
  );
}