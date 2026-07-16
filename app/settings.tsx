import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import {
  fontScales,
  listDensities,
  playerLayouts,
  themePresets,
  uiStyles,
  type FontScale,
  type ListDensity,
  type PlayerLayout,
  type ThemePreset,
  type UiStyle,
  useTheme,
} from "@/theme";
import { ThemedCard } from "@/components/ui/ThemedCard";
import { ThemedScreen } from "@/components/ui/ThemedScreen";

const STYLE_LABELS: Record<UiStyle, string> = {
  default: "精致默认",
  frosted: "极致毛玻璃",
  liquid: "液态玻璃",
  miui: "MIUI",
};

const PRESET_LABELS: Record<ThemePreset, string> = {
  midnight: "暗夜紫",
  black: "纯黑",
  daylight: "白昼",
  aurora: "极光",
};

const PRESET_COLORS: Record<ThemePreset, string> = {
  midnight: "#a855f7",
  black: "#00d4ff",
  daylight: "#f472b6",
  aurora: "#34d399",
};

const PLAYER_LABELS: Record<PlayerLayout, string> = {
  vinyl: "经典唱片",
  immersive: "沉浸背景",
  minimal: "极简列表",
};

const FONT_LABELS: Record<FontScale, string> = { small: "小", medium: "中", large: "大" };
const DENSITY_LABELS: Record<ListDensity, string> = { compact: "紧凑", comfortable: "舒适" };
const CUSTOM_COLORS = ["#a855f7", "#ec4899", "#f97316", "#22c55e", "#06b6d4", "#3b82f6"];

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
            className="min-h-11 items-center justify-center px-4 py-2"
            style={{
              borderRadius: tokens.pillRadius,
              backgroundColor: active ? tokens.accent : `${tokens.surfaceStrong}bb`,
              borderWidth: 1,
              borderColor: active ? tokens.accent : tokens.surfaceBorder,
            }}
            onPress={() => onSelect(option)}
          >
            <Text style={{ color: active ? "#101010" : tokens.text, fontWeight: "700", fontSize: 13 }}>
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen(): React.JSX.Element {
  const {
    preferences,
    tokens,
    setCustomAccent,
    setFontScale,
    setListDensity,
    setMagicColorEnabled,
    setPlayerLayout,
    setPreset,
    setUiStyle,
  } = useTheme();

  return (
    <ThemedScreen>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-16">
        <View className="flex-row items-center justify-between">
          <Pressable className="min-h-11 min-w-11 items-center justify-center" onPress={() => router.back()}>
            <Text style={{ color: tokens.accent, fontSize: 26 }}>‹</Text>
          </Pressable>
          <Text style={{ color: tokens.text, fontSize: 24, fontWeight: "800" }}>外观与设置</Text>
          <View className="w-11" />
        </View>

        <Text className="mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>APPEARANCE</Text>
        <ThemedCard className="mt-3">
          <Text style={{ color: tokens.text, fontSize: 18, fontWeight: "800" }}>UI 风格</Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: tokens.mutedText }}>
            切换卡片、边框、圆角、阴影和背景氛围。
          </Text>
          <OptionRow options={uiStyles} selected={preferences.uiStyle} labels={STYLE_LABELS} onSelect={(value) => void setUiStyle(value)} />
        </ThemedCard>

        <ThemedCard className="mt-4">
          <Text style={{ color: tokens.text, fontSize: 18, fontWeight: "800" }}>主题色</Text>
          <View className="mt-4 flex-row justify-between">
            {themePresets.map((preset) => {
              const active = preferences.preset === preset && !preferences.customAccent;
              return (
                <Pressable key={preset} className="items-center" onPress={() => { void setCustomAccent(null); void setPreset(preset); }}>
                  <View
                    className="h-11 w-11 rounded-full border-2"
                    style={{ backgroundColor: PRESET_COLORS[preset], borderColor: active ? tokens.text : "transparent" }}
                  />
                  <Text className="mt-2 text-[10px]" style={{ color: tokens.mutedText }}>{PRESET_LABELS[preset]}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-6 text-sm font-bold" style={{ color: tokens.text }}>自定义强调色</Text>
          <View className="mt-3 flex-row gap-3">
            {CUSTOM_COLORS.map((color) => (
              <Pressable
                key={color}
                className="h-9 w-9 rounded-full border-2"
                style={{ backgroundColor: color, borderColor: preferences.customAccent === color ? tokens.text : "transparent" }}
                onPress={() => void setCustomAccent(color)}
              />
            ))}
          </View>
          <View className="mt-6 flex-row items-center justify-between border-t pt-5" style={{ borderColor: tokens.surfaceBorder }}>
            <View className="flex-1 pr-4">
              <Text style={{ color: tokens.text, fontSize: 15, fontWeight: "800" }}>🎨 Magic Color</Text>
              <Text className="mt-1 text-xs leading-5" style={{ color: tokens.mutedText }}>
                已预留封面主色接入；当前播放源提供颜色后会自动覆盖主题色。
              </Text>
            </View>
            <Switch
              value={preferences.magicColorEnabled}
              trackColor={{ false: "#64748b", true: tokens.accent }}
              thumbColor="#ffffff"
              onValueChange={(value) => void setMagicColorEnabled(value)}
            />
          </View>
        </ThemedCard>

        <Text className="mt-8 text-xs font-bold tracking-[2px]" style={{ color: tokens.mutedText }}>PLAYER</Text>
        <ThemedCard className="mt-3">
          <Text style={{ color: tokens.text, fontSize: 18, fontWeight: "800" }}>播放器样式</Text>
          <OptionRow options={playerLayouts} selected={preferences.playerLayout} labels={PLAYER_LABELS} onSelect={(value) => void setPlayerLayout(value)} />
        </ThemedCard>

        <ThemedCard className="mt-4">
          <Text style={{ color: tokens.text, fontSize: 18, fontWeight: "800" }}>阅读与列表</Text>
          <Text className="mt-5 text-sm font-bold" style={{ color: tokens.text }}>字体大小</Text>
          <OptionRow options={fontScales} selected={preferences.fontScale} labels={FONT_LABELS} onSelect={(value) => void setFontScale(value)} />
          <Text className="mt-6 text-sm font-bold" style={{ color: tokens.text }}>列表显示密度</Text>
          <OptionRow options={listDensities} selected={preferences.listDensity} labels={DENSITY_LABELS} onSelect={(value) => void setListDensity(value)} />
        </ThemedCard>

        <Text className="mt-7 text-center text-xs" style={{ color: tokens.mutedText }}>
          Hyacine.music · Preferences are stored securely on this device
        </Text>
      </ScrollView>
    </ThemedScreen>
  );
}