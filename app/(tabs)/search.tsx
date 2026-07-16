import { Text, TextInput, View } from "react-native";
import { useI18n } from "@/i18n";

export default function SearchScreen(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <View className="flex-1 bg-[#09090b] px-5 pt-16">
      <Text className="text-3xl font-bold tracking-tight text-white">{t("search")}</Text>
      <Text className="mt-2 text-sm text-zinc-500">{t("searchHint")}</Text>
      <View className="mt-8 flex-row items-center rounded-2xl border border-zinc-800 bg-[#151516] px-4">
        <Text className="mr-3 text-xl text-lime-300">⌕</Text>
        <TextInput
          className="h-14 flex-1 text-base text-white"
          placeholder={t("searchPlaceholder")}
          placeholderTextColor="#777a72"
          returnKeyType="search"
        />
      </View>
      <View className="mt-7 rounded-3xl border border-zinc-800 bg-[#121214] p-6">
        <Text className="text-xs font-bold tracking-[2px] text-lime-300">HYACINE</Text>
        <Text className="mt-4 text-xl font-bold text-white">{t("browseTitle")}</Text>
        <Text className="mt-2 text-sm leading-6 text-zinc-500">{t("browseHint")}</Text>
      </View>
    </View>
  );
}