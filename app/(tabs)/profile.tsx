import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { languages, type Language, useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

const languageLabels: Record<Language, string> = { "zh-CN": "简体中文", en: "English", ja: "日本語" };

export default function ProfileScreen(): React.JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const { profile } = useAccount();
  const { tokens } = useTheme();
  return <ThemedScreen><ScrollView contentContainerClassName="px-5 pb-40 pt-14">
    <View className="flex-row items-center justify-between"><Text style={{ color: tokens.text, fontSize: 28, fontWeight: "800" }}>{t("profileTitle")}</Text><Pressable className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.push("/settings")}><Text style={{ color: tokens.text, fontSize: 17 }}>⚙</Text></Pressable></View>
    <Pressable className="mt-8 flex-row items-center" onPress={() => router.push("/onboarding")}><Image className="h-16 w-16 rounded-full" source={{ uri: profile?.avatarUrl }} style={{ backgroundColor: `${tokens.accent}24` }} /><View className="ml-4 flex-1"><Text style={{ color: tokens.text, fontSize: 20, fontWeight: "800" }}>{profile?.displayName}</Text><Text className="mt-1 text-xs" numberOfLines={1} style={{ color: tokens.mutedText }}>{profile?.backendUrl}</Text></View><Text style={{ color: tokens.mutedText, fontSize: 24 }}>›</Text></Pressable>
    <View className="mt-9 h-px" style={{ backgroundColor: tokens.surfaceBorder }} />
    <Text className="mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("language").toUpperCase()}</Text>
    <View className="mt-3">{languages.map((item, index) => <Pressable key={item} className="flex-row items-center justify-between py-4" style={index ? { borderTopWidth: 1, borderColor: tokens.surfaceBorder } : undefined} onPress={() => void setLanguage(item)}><Text style={{ color: language === item ? tokens.accent : tokens.text, fontWeight: "700" }}>{languageLabels[item]}</Text><Text style={{ color: language === item ? tokens.accent : tokens.mutedText }}>{language === item ? "●" : "○"}</Text></Pressable>)}</View>
    <Text className="mt-9 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("appearance").toUpperCase()}</Text>
    <Pressable className="mt-3 flex-row items-center justify-between py-4" onPress={() => router.push("/settings")}><View><Text style={{ color: tokens.text, fontWeight: "800" }}>{t("darkMode")}</Text><Text className="mt-1 text-xs" style={{ color: tokens.mutedText }}>UI style · theme · player layout</Text></View><LiquidControlSurface className="h-9 w-9 items-center justify-center rounded-full"><Text style={{ color: tokens.text, fontSize: 20 }}>›</Text></LiquidControlSurface></Pressable>
  </ScrollView></ThemedScreen>;
}