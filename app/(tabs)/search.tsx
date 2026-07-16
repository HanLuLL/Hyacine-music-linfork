import { ScrollView, Text, TextInput, View } from "react-native";
import { useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

export default function SearchScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();
  return <ThemedScreen><ScrollView contentContainerClassName="px-5 pb-40 pt-16">
    <Text style={{ color: tokens.text, fontSize: 31, fontWeight: "800" }}>{t("search")}</Text>
    <Text className="mt-2 text-sm" style={{ color: tokens.mutedText }}>{t("searchHint")}</Text>
    <LiquidControlSurface className="mt-8 h-14 flex-row items-center rounded-full px-5" style={{ borderRadius: 28 }}><Text className="mr-3 text-xl" style={{ color: tokens.mutedText }}>⌕</Text><TextInput className="h-full flex-1 text-base" style={{ color: tokens.text }} placeholder={t("searchPlaceholder")} placeholderTextColor={tokens.mutedText} returnKeyType="search" /></LiquidControlSurface>
    <Text className="mt-12 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>DISCOVER</Text>
    <Text className="mt-4 text-2xl font-bold" style={{ color: tokens.text }}>{t("browseTitle")}</Text>
    <Text className="mt-3 text-sm leading-6" style={{ color: tokens.mutedText }}>{t("browseHint")}</Text>
    <View className="mt-8 h-px" style={{ backgroundColor: tokens.surfaceBorder }} />
  </ScrollView></ThemedScreen>;
}