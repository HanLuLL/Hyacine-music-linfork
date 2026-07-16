import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useAccount } from "@/account";
import { languages, type Language, useI18n } from "@/i18n";
import { LiquidControlSurface } from "@/components/ui/LiquidControlSurface";
import { ThemedScreen } from "@/components/ui/ThemedScreen";
import { fontScales, listDensities, playerLayouts, presetAccents, themePresets, uiStyles, type FontScale, type ListDensity, type PlayerLayout, type UiStyle, useTheme } from "@/theme";

const quickColors = ["#7C3AED", "#EC4899", "#F97316", "#22C55E", "#06B6D4", "#3B82F6"];
const validHex = /^#[0-9A-Fa-f]{6}$/;
const languageLabels: Record<Language, string> = { "zh-CN": "简体中文", en: "English", ja: "日本語" };

function Segment<T extends string>({ options, value, labels, onChange }: { options: readonly T[]; value: T; labels: Record<T, string>; onChange: (next: T) => void }): React.JSX.Element {
  const { tokens } = useTheme();
  return <LiquidControlSurface className="mt-4 flex-row rounded-full p-1" style={{ borderRadius: 24 }}>{options.map((option) => <Pressable key={option} className="h-10 flex-1 items-center justify-center" style={{ borderRadius: 20, backgroundColor: option === value ? `${tokens.text}18` : "transparent" }} onPress={() => onChange(option)}><Text numberOfLines={1} style={{ color: option === value ? tokens.text : tokens.mutedText, fontSize: 13, fontWeight: "800" }}>{labels[option]}</Text></Pressable>)}</LiquidControlSurface>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element { const { tokens } = useTheme(); return <View className="mt-9"><Text className="text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>{title}</Text>{children}</View>; }
function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }): React.JSX.Element { const { tokens } = useTheme(); return <View className="border-b py-5" style={{ borderColor: tokens.surfaceBorder }}><Text style={{ color: tokens.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>{hint ? <Text className="mt-1 text-xs leading-5" style={{ color: tokens.mutedText }}>{hint}</Text> : null}{children}</View>; }

export default function SettingsScreen(): React.JSX.Element {
  const { preferences, tokens, setCustomAccent, setFontScale, setListDensity, setMagicColorEnabled, setPlayerLayout, setPreset, setUiStyle } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { profile } = useAccount();
  const [hex, setHex] = useState(preferences.customAccent ?? "");
  useEffect(() => setHex(preferences.customAccent ?? ""), [preferences.customAccent]);
  const apply = (value: string): void => { const next = value.trim().toUpperCase(); setHex(next); if (validHex.test(next)) void setCustomAccent(next); };
  const styles: Record<UiStyle, string> = { native: t("styleNative"), liquid: t("styleLiquid"), miuix: t("styleMiuix") };
  const layouts: Record<PlayerLayout, string> = { vinyl: t("layoutVinyl"), immersive: t("layoutImmersive"), minimal: t("layoutMinimal") };
  const fonts: Record<FontScale, string> = { small: t("fontSmall"), medium: t("fontMedium"), large: t("fontLarge") };
  const densities: Record<ListDensity, string> = { compact: t("densityCompact"), comfortable: t("densityComfortable") };

  return <ThemedScreen><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-16 pt-14">
    <View className="flex-row items-center justify-between"><Pressable className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.surfaceBorder }} onPress={() => router.back()}><Text style={{ color: tokens.text, fontSize: 30, lineHeight: 30 }}>‹</Text></Pressable><Text style={{ color: tokens.text, fontSize: 22, fontWeight: "800" }}>{t("settingsTitle")}</Text><View className="w-11" /></View>
    <Section title={t("accountSection")}><Row title={t("language")}><View className="mt-4 flex-row gap-2">{languages.map((item) => <Pressable key={item} className="h-10 flex-1 items-center justify-center rounded-full" style={{ backgroundColor: language === item ? `${tokens.accent}22` : tokens.surface, borderWidth: 1, borderColor: language === item ? tokens.accent : tokens.surfaceBorder }} onPress={() => void setLanguage(item)}><Text numberOfLines={1} style={{ color: language === item ? tokens.accent : tokens.text, fontSize: 12, fontWeight: "800" }}>{languageLabels[item]}</Text></Pressable>)}</View></Row><Row title={t("musicService")} hint={profile?.musicSource === "netease" ? t("neteaseCloud") : t("apiReady")}><Pressable className="mt-4 flex-row items-center justify-between" onPress={() => router.push("/sources")}><Text style={{ color: tokens.accent, fontWeight: "800" }}>{t("manageMusicService")}</Text><Text style={{ color: tokens.accent, fontSize: 20 }}>›</Text></Pressable></Row></Section>
    <Section title={t("appearanceSection")}><Row title={t("uiStyle")} hint={t("uiStyleHint")}><Segment options={uiStyles} value={preferences.uiStyle} labels={styles} onChange={(value) => void setUiStyle(value)} /></Row><Row title={t("themeColor")}><View className="mt-4 flex-row justify-between">{themePresets.map((preset) => <Pressable key={preset} className="items-center" onPress={() => void setPreset(preset)}><View className="h-11 w-11 rounded-full border-2" style={{ backgroundColor: presetAccents[preset], borderColor: preferences.preset === preset && preferences.customAccent === null ? tokens.text : "transparent" }} /></Pressable>)}</View></Row><Row title={t("customAccent")} hint={t("colorInputHint")}><View className="mt-3 flex-row items-center gap-3"><View className="h-10 w-10 rounded-full" style={{ backgroundColor: validHex.test(hex) ? hex : tokens.accent }} /><LiquidControlSurface className="h-11 flex-1 rounded-full px-4" style={{ borderRadius: 22 }}><TextInput value={hex} maxLength={7} autoCapitalize="characters" placeholder={t("colorInputPlaceholder")} placeholderTextColor={tokens.mutedText} onChangeText={apply} style={{ color: tokens.text, height: "100%" }} /></LiquidControlSurface></View><View className="mt-4 flex-row justify-between">{quickColors.map((color) => <Pressable key={color} className="h-9 w-9 rounded-full" style={{ backgroundColor: color, borderWidth: 2, borderColor: preferences.customAccent === color ? tokens.text : "transparent" }} onPress={() => apply(color)} />)}</View></Row><Row title={t("magicColor")} hint={t("magicColorHint")}><View className="absolute right-0 top-6"><Switch value={preferences.magicColorEnabled} trackColor={{ false: "#77859a", true: tokens.accent }} onValueChange={(value) => void setMagicColorEnabled(value)} /></View></Row></Section>
    <Section title={t("playerSection")}><Row title={t("playerLayout")}><Segment options={playerLayouts} value={preferences.playerLayout} labels={layouts} onChange={(value) => void setPlayerLayout(value)} /></Row><Row title={t("fontSize")}><Segment options={fontScales} value={preferences.fontScale} labels={fonts} onChange={(value) => void setFontScale(value)} /></Row><Row title={t("density")}><Segment options={listDensities} value={preferences.listDensity} labels={densities} onChange={(value) => void setListDensity(value)} /></Row></Section>
  </ScrollView></ThemedScreen>;
}