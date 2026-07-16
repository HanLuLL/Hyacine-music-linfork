import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { fontScales, listDensities, playerLayouts, themePresets, uiStyles, type FontScale, type ListDensity, type PlayerLayout, type ThemePreset, type UiStyle, useTheme } from "@/theme";
import { useI18n } from "@/i18n";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";

const colors: Record<ThemePreset, string> = { midnight: "#a855f7", black: "#00d4ff", daylight: "#f472b6", aurora: "#34d399" };
const quickColors = ["#7C3AED", "#EC4899", "#F97316", "#22C55E", "#06B6D4", "#3B82F6"];
const validHex = /^#[0-9A-Fa-f]{6}$/;

function Segment<T extends string>({ options, value, labels, onChange }: { options: readonly T[]; value: T; labels: Record<T, string>; onChange: (next: T) => void }): React.JSX.Element {
  const { preferences, tokens } = useTheme();
  const liquid = preferences.uiStyle === "liquid";
  return <View className="mt-4 flex-row rounded-full p-1" style={{ backgroundColor: liquid ? "#ffffff24" : `${tokens.text}0a` }}>
    {options.map((option) => <Pressable key={option} className="min-h-11 flex-1 items-center justify-center px-2" style={{ borderRadius: tokens.pillRadius, backgroundColor: option === value ? (liquid ? "#ffffff8a" : tokens.surfaceStrong) : "transparent" }} onPress={() => onChange(option)}>
      <Text numberOfLines={1} style={{ color: option === value ? tokens.text : tokens.mutedText, fontSize: 13, fontWeight: "800" }}>{labels[option]}</Text>
    </Pressable>)}
  </View>;
}

function Row({ title, hint, children, border = true }: { title: string; hint?: string; children: React.ReactNode; border?: boolean }): React.JSX.Element {
  const { tokens } = useTheme();
  return <View className={border ? "border-b py-5" : "pb-5"} style={border ? { borderColor: `${tokens.surfaceBorder}aa` } : undefined}>
    <Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>
    {hint ? <Text className="mt-1 text-xs leading-5" style={{ color: tokens.mutedText }}>{hint}</Text> : null}
    {children}
  </View>;
}

export default function SettingsScreen(): React.JSX.Element {
  const { preferences, tokens, setCustomAccent, setFontScale, setListDensity, setMagicColorEnabled, setPlayerLayout, setPreset, setUiStyle } = useTheme();
  const { t } = useI18n();
  const [hex, setHex] = useState(preferences.customAccent ?? "");
  useEffect(() => setHex(preferences.customAccent ?? ""), [preferences.customAccent]);
  const apply = (value: string): void => { const next = value.trim().toUpperCase(); setHex(next); if (validHex.test(next)) void setCustomAccent(next); };
  const styles: Record<UiStyle, string> = { native: t("styleNative"), liquid: t("styleLiquid"), miuix: t("styleMiuix") };
  const layouts: Record<PlayerLayout, string> = { vinyl: t("layoutVinyl"), immersive: t("layoutImmersive"), minimal: t("layoutMinimal") };
  const fonts: Record<FontScale, string> = { small: t("fontSmall"), medium: t("fontMedium"), large: t("fontLarge") };
  const densities: Record<ListDensity, string> = { compact: t("densityCompact"), comfortable: t("densityComfortable") };
  const isLiquid = preferences.uiStyle === "liquid";

  return <ThemedScreen><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-14 pt-14">
    <View className="flex-row items-center justify-between pb-7">
      <Pressable className="h-11 w-11 items-center justify-center" style={{ borderRadius: 22, backgroundColor: isLiquid ? "#ffffff32" : tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.back()}><Text style={{ color: tokens.text, fontSize: 30, lineHeight: 30 }}>‹</Text></Pressable>
      <Text style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{t("settingsTitle")}</Text><View className="w-11" />
    </View>
    <Text className="mb-3 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("appearanceSection")}</Text>
    <ThemedCard className="p-5">
      <Row title={t("uiStyle")} hint={t("uiStyleHint")}><Segment options={uiStyles} value={preferences.uiStyle} labels={styles} onChange={(v) => void setUiStyle(v)} /></Row>
      <Row title={t("themeColor")}>
        <View className="mt-4 flex-row justify-between">{themePresets.map((preset) => <Pressable key={preset} className="items-center" onPress={() => { void setCustomAccent(null); void setPreset(preset); }}><View className="h-11 w-11 rounded-full border-2" style={{ backgroundColor: colors[preset], borderColor: preferences.preset === preset && !preferences.customAccent ? tokens.text : "transparent" }} /></Pressable>)}</View>
      </Row>
      <Row title={t("customAccent")} hint={t("colorInputHint")}>
        <View className="mt-3 flex-row items-center gap-3"><View className="h-10 w-10 rounded-full" style={{ backgroundColor: validHex.test(hex) ? hex : tokens.accent }} /><TextInput className="h-11 flex-1 px-4" value={hex} maxLength={7} autoCapitalize="characters" placeholder={t("colorInputPlaceholder")} placeholderTextColor={tokens.mutedText} onChangeText={apply} style={{ color: tokens.text, borderRadius: tokens.pillRadius, borderWidth: 1, borderColor: tokens.surfaceBorder, backgroundColor: isLiquid ? "#ffffff1d" : tokens.surfaceStrong }} /></View>
        <View className="mt-4 flex-row justify-between">{quickColors.map((color) => <Pressable key={color} className="h-9 w-9 rounded-full" style={{ backgroundColor: color, borderWidth: 2, borderColor: preferences.customAccent === color ? tokens.text : "transparent" }} onPress={() => apply(color)} />)}</View>
      </Row>
      <Row title={t("magicColor")} hint={t("magicColorHint")} border={false}><View className="absolute right-0 top-6"><Switch value={preferences.magicColorEnabled} trackColor={{ false: "#77859a", true: tokens.accent }} onValueChange={(v) => void setMagicColorEnabled(v)} /></View></Row>
    </ThemedCard>
    <Text className="mb-3 mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{t("playerSection")}</Text>
    <ThemedCard className="p-5"><Row title={t("playerLayout")} border={false}><Segment options={playerLayouts} value={preferences.playerLayout} labels={layouts} onChange={(v) => void setPlayerLayout(v)} /></Row></ThemedCard>
    <ThemedCard className="mt-3 p-5"><Row title={t("fontSize")}><Segment options={fontScales} value={preferences.fontScale} labels={fonts} onChange={(v) => void setFontScale(v)} /></Row><Row title={t("density")} border={false}><Segment options={listDensities} value={preferences.listDensity} labels={densities} onChange={(v) => void setListDensity(v)} /></Row></ThemedCard>
  </ScrollView></ThemedScreen>;
}