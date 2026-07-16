import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  fontScales, listDensities, playerLayouts, themePresets, uiStyles,
  type FontScale, type ListDensity, type PlayerLayout, type ThemePreset, type UiStyle, useTheme,
} from "@/theme";
import { useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";

const PRESET_COLORS: Record<ThemePreset, string> = {
  midnight: "#a855f7", black: "#00d4ff", daylight: "#f472b6", aurora: "#34d399",
};
const QUICK_COLORS = ["#7C3AED", "#EC4899", "#F97316", "#22C55E", "#06B6D4", "#3B82F6"];
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

interface OptionRowProps<T extends string> {
  options: readonly T[];
  selected: T;
  labels: Record<T, string>;
  onSelect: (value: T) => void;
}

function OptionRow<T extends string>({ options, selected, labels, onSelect }: OptionRowProps<T>): React.JSX.Element {
  const { tokens } = useTheme();
  return (
    <View className="mt-3 flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className="min-h-11 items-center justify-center px-4 py-2"
            style={{ borderRadius: tokens.pillRadius, backgroundColor: active ? tokens.accent : `${tokens.surfaceStrong}dd`, borderWidth: 1, borderColor: active ? tokens.accent : tokens.surfaceBorder }}
            onPress={() => onSelect(option)}
          >
            <Text style={{ color: active ? (tokens.isLight ? "#ffffff" : "#101010") : tokens.text, fontWeight: "700", fontSize: 13 }}>{labels[option]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen(): React.JSX.Element {
  const { preferences, tokens, setCustomAccent, setFontScale, setListDensity, setMagicColorEnabled, setPlayerLayout, setPreset, setUiStyle } = useTheme();
  const { t } = useI18n();
  const [hexValue, setHexValue] = useState(preferences.customAccent ?? "");
  const [hexTouched, setHexTouched] = useState(false);
  const validHex = HEX_COLOR.test(hexValue);

  useEffect(() => {
    setHexValue(preferences.customAccent ?? "");
  }, [preferences.customAccent]);

  const applyHex = (value: string): void => {
    const normalized = value.trim().toUpperCase();
    setHexValue(normalized);
    setHexTouched(true);
    if (HEX_COLOR.test(normalized)) void setCustomAccent(normalized);
  };

  const styleLabels: Record<UiStyle, string> = {
    default: t("styleDefault"), frosted: t("styleFrosted"), liquid: t("styleLiquid"), miui: t("styleMiui"),
  };
  const presetLabels: Record<ThemePreset, string> = {
    midnight: t("presetMidnight"), black: t("presetBlack"), daylight: t("presetDaylight"), aurora: t("presetAurora"),
  };
  const layoutLabels: Record<PlayerLayout, string> = {
    vinyl: t("layoutVinyl"), immersive: t("layoutImmersive"), minimal: t("layoutMinimal"),
  };
  const fontLabels: Record<FontScale, string> = { small: t("fontSmall"), medium: t("fontMedium"), large: t("fontLarge") };
  const densityLabels: Record<ListDensity, string> = { compact: t("densityCompact"), comfortable: t("densityComfortable") };

  return (
    <ThemedScreen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-12 pt-14">
        <View className="flex-row items-center justify-between border-b pb-4" style={{ borderColor: tokens.surfaceBorder }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("backToHome")} className="h-9 w-9 items-center justify-center" style={{ borderRadius: 18, borderColor: tokens.surfaceBorder, borderWidth: 1, backgroundColor: tokens.surface }} onPress={() => router.back()}>
            <Text style={{ color: tokens.text, fontSize: 22 }}>‹</Text>
          </Pressable>
          <Text style={{ color: tokens.text, fontSize: 20, fontWeight: "800" }}>{t("settingsTitle")}</Text>
          <View className="w-9" />
        </View>

        <Text className="mt-6 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("appearanceSection")}</Text>
        <ThemedCard className="mt-3 p-4">
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{t("uiStyle")}</Text>
          <Text className="mt-1 text-xs leading-4" style={{ color: tokens.mutedText }}>{t("uiStyleHint")}</Text>
          <OptionRow options={uiStyles} selected={preferences.uiStyle} labels={styleLabels} onSelect={(value) => void setUiStyle(value)} />
        </ThemedCard>

        <ThemedCard className="mt-3 p-4">
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{t("themeColor")}</Text>
          <View className="mt-4 flex-row justify-between">
            {themePresets.map((preset) => {
              const active = preferences.preset === preset && !preferences.customAccent;
              return (
                <Pressable key={preset} accessibilityRole="button" accessibilityState={{ selected: active }} className="items-center" onPress={() => { setHexTouched(false); void setCustomAccent(null); void setPreset(preset); }}>
                  <View className="h-11 w-11 rounded-full border-2" style={{ backgroundColor: PRESET_COLORS[preset], borderColor: active ? tokens.text : "transparent" }} />
                  <Text className="mt-2 text-[10px]" style={{ color: tokens.mutedText }}>{presetLabels[preset]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-6 text-sm font-bold" style={{ color: tokens.text }}>{t("customAccent")}</Text>
          <View className="mt-3 flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full border-2" style={{ backgroundColor: validHex ? hexValue : tokens.accent, borderColor: tokens.surfaceBorder }} />
            <TextInput
              accessibilityLabel={t("customAccent")}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              placeholder={t("colorInputPlaceholder")}
              placeholderTextColor={tokens.mutedText}
              selectionColor={tokens.accent}
              value={hexValue}
              onChangeText={applyHex}
              style={{ flex: 1, minHeight: 44, color: tokens.text, borderColor: hexTouched && !validHex ? "#ef4444" : tokens.surfaceBorder, borderWidth: 1, borderRadius: tokens.pillRadius, paddingHorizontal: 14, backgroundColor: tokens.surfaceStrong }}
            />
          </View>
          <Text className="mt-2 text-xs leading-5" style={{ color: hexTouched && !validHex ? "#ef4444" : tokens.mutedText }}>
            {hexTouched && !validHex ? t("colorInvalid") : t("colorInputHint")}
          </Text>
          <View className="mt-3 flex-row gap-3">
            {QUICK_COLORS.map((color) => (
              <Pressable key={color} accessibilityRole="button" accessibilityLabel={color} className="h-9 w-9 rounded-full border-2" style={{ backgroundColor: color, borderColor: preferences.customAccent === color ? tokens.text : "transparent" }} onPress={() => applyHex(color)} />
            ))}
          </View>
          {preferences.customAccent ? (
            <Pressable accessibilityRole="button" className="mt-5 self-start px-1" onPress={() => { setHexTouched(false); void setCustomAccent(null); }}>
              <Text style={{ color: tokens.accent, fontWeight: "700" }}>{t("resetToPreset")}</Text>
            </Pressable>
          ) : null}
          <View className="mt-5 flex-row items-center justify-between border-t pt-5" style={{ borderColor: tokens.surfaceBorder }}>
            <View className="flex-1 pr-4">
              <Text style={{ color: tokens.text, fontSize: 15, fontWeight: "800" }}>{t("magicColor")}</Text>
              <Text className="mt-1 text-xs leading-5" style={{ color: tokens.mutedText }}>{t("magicColorHint")}</Text>
            </View>
            <Switch value={preferences.magicColorEnabled} trackColor={{ false: "#64748b", true: tokens.accent }} thumbColor="#ffffff" onValueChange={(value) => void setMagicColorEnabled(value)} />
          </View>
        </ThemedCard>

        <Text className="mt-6 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("playerSection")}</Text>
        <ThemedCard className="mt-3 p-4">
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{t("playerLayout")}</Text>
          <OptionRow options={playerLayouts} selected={preferences.playerLayout} labels={layoutLabels} onSelect={(value) => void setPlayerLayout(value)} />
        </ThemedCard>
        <ThemedCard className="mt-3 p-4">
          <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{t("readingList")}</Text>
          <Text className="mt-4 text-sm font-bold" style={{ color: tokens.text }}>{t("fontSize")}</Text>
          <OptionRow options={fontScales} selected={preferences.fontScale} labels={fontLabels} onSelect={(value) => void setFontScale(value)} />
          <Text className="mt-5 text-sm font-bold" style={{ color: tokens.text }}>{t("density")}</Text>
          <OptionRow options={listDensities} selected={preferences.listDensity} labels={densityLabels} onSelect={(value) => void setListDensity(value)} />
        </ThemedCard>
        <Text className="mt-7 text-center text-xs" style={{ color: tokens.mutedText }}>Hyacine.music · {t("preferencesStored")}</Text>
      </ScrollView>
    </ThemedScreen>
  );
}