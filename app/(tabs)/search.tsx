import { Text, TextInput, View } from "react-native";
import { useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

export default function SearchScreen(): React.JSX.Element {
  const { t } = useI18n();
  const { tokens } = useTheme();

  return (
    <ThemedScreen>
      <View className="flex-1 px-5 pt-16">
        <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "800" }}>{t("search")}</Text>
        <Text className="mt-2 text-sm" style={{ color: tokens.mutedText }}>{t("searchHint")}</Text>

        <View
          className="mt-8 flex-row items-center border px-4"
          style={{ borderRadius: tokens.pillRadius, borderColor: tokens.surfaceBorder, backgroundColor: tokens.surfaceStrong }}
        >
          <Text className="mr-3 text-xl" style={{ color: tokens.accent }}>⌕</Text>
          <TextInput
            className="h-14 flex-1 text-base"
            style={{ color: tokens.text }}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={tokens.mutedText}
            returnKeyType="search"
          />
        </View>

        <ThemedCard className="mt-7">
          <Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.accent }}>HYACINE</Text>
          <Text className="mt-4 text-xl font-bold" style={{ color: tokens.text }}>{t("browseTitle")}</Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: tokens.mutedText }}>{t("browseHint")}</Text>
        </ThemedCard>
      </View>
    </ThemedScreen>
  );
}