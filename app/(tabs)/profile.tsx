import { Pressable, ScrollView, Text, View } from "react-native";
import { languages, type Language, useI18n } from "@/i18n";

const languageLabels: Record<Language, string> = {
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
};

export default function ProfileScreen(): React.JSX.Element {
  const { language, setLanguage, t } = useI18n();

  return (
    <ScrollView className="flex-1 bg-[#09090b]" contentContainerClassName="px-5 pb-10 pt-16">
      <Text className="text-3xl font-bold tracking-tight text-white">{t("profileTitle")}</Text>
      <View className="mt-8 rounded-3xl border border-zinc-800 bg-[#121214] p-5">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-lime-300">
          <Text className="text-lg font-bold text-[#171a13]">H</Text>
        </View>
        <Text className="mt-5 text-xl font-bold text-white">{t("notSignedIn")}</Text>
        <Text className="mt-2 text-sm leading-6 text-zinc-500">{t("profileHint")}</Text>
      </View>

      <Text className="mt-9 text-xs font-bold tracking-[2px] text-zinc-500">{t("language").toUpperCase()}</Text>
      <View className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-[#121214]">
        {languages.map((item, index) => {
          const selected = language === item;
          return (
            <Pressable
              key={item}
              className={`flex-row items-center justify-between px-5 py-4 ${index ? "border-t border-zinc-800" : ""}`}
              onPress={() => void setLanguage(item)}
            >
              <Text className={selected ? "font-semibold text-lime-300" : "font-semibold text-zinc-300"}>
                {languageLabels[item]}
              </Text>
              <Text className={selected ? "text-lime-300" : "text-zinc-700"}>{selected ? "●" : "○"}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-9 text-xs font-bold tracking-[2px] text-zinc-500">{t("appearance").toUpperCase()}</Text>
      <View className="mt-3 rounded-2xl border border-zinc-800 bg-[#121214] px-5 py-4">
        <Text className="font-semibold text-zinc-200">{t("darkMode")}</Text>
      </View>
      <View className="mt-3 rounded-2xl border border-zinc-800 bg-[#121214] px-5 py-4">
        <Text className="text-xs font-bold tracking-wider text-zinc-500">{t("apiStatus").toUpperCase()}</Text>
        <Text className="mt-2 font-semibold text-lime-300">● {t("apiReady")}</Text>
      </View>
    </ScrollView>
  );
}