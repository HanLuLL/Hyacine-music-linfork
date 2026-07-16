import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { languages, type Language, useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { useTheme } from "@/theme";

const languageLabels: Record<Language, string> = {
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
};

export default function ProfileScreen(): React.JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const { tokens } = useTheme();

  return (
    <ThemedScreen>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-16">
        <View className="flex-row items-center justify-between">
          <Text style={{ color: tokens.text, fontSize: 30, fontWeight: "800" }}>{t("profileTitle")}</Text>
          <Pressable
            accessibilityLabel="Settings"
            className="h-11 w-11 items-center justify-center"
            style={{ borderRadius: tokens.pillRadius, backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, borderWidth: 1 }}
            onPress={() => router.push("/settings")}
          >
            <Text style={{ color: tokens.accent, fontSize: 20 }}>⚙</Text>
          </Pressable>
        </View>
        <ThemedCard className="mt-8">
          <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: tokens.accent }}>
            <Text className="text-lg font-bold text-black">H</Text>
          </View>
          <Text className="mt-5 text-xl font-bold" style={{ color: tokens.text }}>{t("notSignedIn")}</Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: tokens.mutedText }}>{t("profileHint")}</Text>
        </ThemedCard>

        <Text className="mt-9 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("language").toUpperCase()}</Text>
        <ThemedCard className="mt-3 p-0">
          {languages.map((item, index) => {
            const selected = language === item;
            return (
              <Pressable
                key={item}
                className={`flex-row items-center justify-between px-5 py-4 ${index ? "border-t" : ""}`}
                style={index ? { borderColor: tokens.surfaceBorder } : undefined}
                onPress={() => void setLanguage(item)}
              >
                <Text style={{ color: selected ? tokens.accent : tokens.text, fontWeight: "700" }}>{languageLabels[item]}</Text>
                <Text style={{ color: selected ? tokens.accent : tokens.mutedText }}>{selected ? "●" : "○"}</Text>
              </Pressable>
            );
          })}
        </ThemedCard>

        <Text className="mt-9 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("appearance").toUpperCase()}</Text>
        <ThemedCard className="mt-3">
          <Text style={{ color: tokens.text, fontWeight: "700" }}>{t("darkMode")}</Text>
          <Pressable className="mt-4 min-h-11 flex-row items-center justify-between" onPress={() => router.push("/settings")}>
            <Text style={{ color: tokens.mutedText }}>UI style · theme · player layout</Text>
            <Text style={{ color: tokens.accent, fontSize: 20 }}>›</Text>
          </Pressable>
        </ThemedCard>
        <ThemedCard className="mt-3">
          <Text className="text-xs font-bold tracking-wider" style={{ color: tokens.mutedText }}>{t("apiStatus").toUpperCase()}</Text>
          <Text className="mt-2 font-semibold" style={{ color: tokens.accent }}>● {t("apiReady")}</Text>
        </ThemedCard>
      </ScrollView>
    </ThemedScreen>
  );
}