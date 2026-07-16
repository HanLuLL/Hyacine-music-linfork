import { Pressable, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

export default function LibraryScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();
  return <ThemedScreen><View className="flex-1 px-5 pt-16">
    <Text style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{t("library")}</Text>
    <View className="flex-1 items-center justify-center pb-28"><View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${tokens.accent}20` }}><Text style={{ color: tokens.accent, fontSize: 34 }}>♫</Text></View><Text className="mt-7 text-2xl font-bold" style={{ color: tokens.text }}>{t("localTitle")}</Text><Text className="mt-3 max-w-72 text-center text-sm leading-6" style={{ color: tokens.mutedText }}>{t("localHint")}</Text><LiquidControlSurface className="mt-8 h-12 items-center justify-center rounded-full px-6" style={{ borderRadius: 24 }}><Pressable onPress={() => void MediaLibrary.requestPermissionsAsync()}><Text style={{ color: tokens.text, fontWeight: "800" }}>{t("allowAudio")}</Text></Pressable></LiquidControlSurface><Text className="mt-5 text-center text-xs" style={{ color: tokens.mutedText }}>{t("permissionNote")}</Text></View>
  </View></ThemedScreen>;
}