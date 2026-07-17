import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export const uiStyles = ["native", "liquid", "miuix"] as const;
export type UiStyle = (typeof uiStyles)[number];
export const themePresets = ["midnight", "black", "daylight", "aurora"] as const;
export type ThemePreset = (typeof themePresets)[number];
export const playerLayouts = ["vinyl", "immersive", "minimal"] as const;
export type PlayerLayout = (typeof playerLayouts)[number];
export const fontScales = ["small", "medium", "large"] as const;
export type FontScale = (typeof fontScales)[number];
export const listDensities = ["compact", "comfortable"] as const;
export type ListDensity = (typeof listDensities)[number];

export interface ThemePreferences {
  uiStyle: UiStyle;
  preset: ThemePreset;
  playerLayout: PlayerLayout;
  fontScale: FontScale;
  listDensity: ListDensity;
  customAccent: string | null;
  magicColorEnabled: boolean;
  customBackgroundUri: string | null;
  backgroundOpacity: number;
  glassOpacity: number;
}

export interface ThemeTokens {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceStrong: string;
  surfaceBorder: string;
  primary: string;
  accent: string;
  text: string;
  mutedText: string;
  cardRadius: number;
  pillRadius: number;
  cardOpacity: number;
  isLight: boolean;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  uiStyle: "liquid",
  preset: "daylight",
  playerLayout: "minimal",
  fontScale: "medium",
  listDensity: "comfortable",
  customAccent: null,
  magicColorEnabled: false,
  customBackgroundUri: null,
  backgroundOpacity: 0.42,
  glassOpacity: 0.34,
};

export const presetAccents: Record<ThemePreset, string> = {
  midnight: "#a855f7",
  black: "#00d4ff",
  daylight: "#4e7a64",
  aurora: "#34d399",
};

const PRESET_COLORS: Record<ThemePreset, Omit<ThemeTokens, "cardRadius" | "pillRadius" | "cardOpacity">> = {
  midnight: {
    background: "#0f0c29",
    backgroundSecondary: "#24243e",
    surface: "#ffffff26",
    surfaceStrong: "#1d1a3a",
    surfaceBorder: "#ffffff33",
    primary: "#1a1a2e",
    accent: "#a855f7",
    text: "#ffffff",
    mutedText: "#c4b5fd",
    isLight: false,
  },
  black: {
    background: "#000000",
    backgroundSecondary: "#1a1a2e",
    surface: "#ffffff14",
    surfaceStrong: "#11111a",
    surfaceBorder: "#ffffff2a",
    primary: "#000000",
    accent: "#00d4ff",
    text: "#ffffff",
    mutedText: "#94a3b8",
    isLight: false,
  },
  daylight: {
    background: "#eef4fb",
    backgroundSecondary: "#e4edf8",
    surface: "#ffffff",
    surfaceStrong: "#ffffff",
    surfaceBorder: "#d7e2ef",
    primary: "#eef4fb",
    accent: "#4e7a64",
    text: "#1d2430",
    mutedText: "#6b7788",
    isLight: true,
  },
  aurora: {
    background: "#0b1120",
    backgroundSecondary: "#1e293b",
    surface: "#ffffff12",
    surfaceStrong: "#111c31",
    surfaceBorder: "#34d39955",
    primary: "#0b1120",
    accent: "#34d399",
    text: "#f0fdf4",
    mutedText: "#94a3b8",
    isLight: false,
  },
};

function clamp01(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function withAlpha(hexOrRgba: string, alpha: number): string {
  const a = clamp01(alpha, 1);
  if (hexOrRgba.startsWith("#") && (hexOrRgba.length === 7 || hexOrRgba.length === 9)) {
    const r = Number.parseInt(hexOrRgba.slice(1, 3), 16);
    const g = Number.parseInt(hexOrRgba.slice(3, 5), 16);
    const b = Number.parseInt(hexOrRgba.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return hexOrRgba;
}

function withStyle(
  base: Omit<ThemeTokens, "cardRadius" | "pillRadius" | "cardOpacity">,
  style: UiStyle,
  accent: string,
  glassOpacity: number,
): ThemeTokens {
  const common = { ...base, accent };
  const glass = clamp01(glassOpacity, DEFAULT_PREFERENCES.glassOpacity);
  if (style === "miuix") {
    return {
      ...common,
      surface: base.isLight ? "#ffffff" : "#262626",
      surfaceStrong: base.isLight ? "#ffffff" : "#202020",
      surfaceBorder: base.isLight ? "#e7e7e9" : "#38383c",
      cardRadius: 22,
      pillRadius: 999,
      cardOpacity: 1,
    };
  }
  if (style === "liquid") {
    return {
      ...common,
      surface: base.isLight ? withAlpha("#ffffff", 0.28 + glass * 0.45) : withAlpha("#10182a", 0.22 + glass * 0.35),
      surfaceStrong: base.isLight ? withAlpha("#ffffff", 0.48 + glass * 0.4) : withAlpha("#172033", 0.42 + glass * 0.35),
      surfaceBorder: base.isLight ? withAlpha("#ffffff", 0.72 + glass * 0.2) : withAlpha("#ffffff", 0.28 + glass * 0.3),
      cardRadius: 28,
      pillRadius: 999,
      cardOpacity: glass,
    };
  }
  return {
    ...common,
    surface: base.isLight ? "#ffffff" : "#ffffff26",
    surfaceStrong: base.isLight ? "#ffffff" : "#1b1836",
    surfaceBorder: base.isLight ? "#deded8" : "#ffffff33",
    cardRadius: 16,
    pillRadius: 999,
    cardOpacity: 0,
  };
}

interface ThemeContextValue {
  preferences: ThemePreferences;
  tokens: ThemeTokens;
  hydrated: boolean;
  setUiStyle: (value: UiStyle) => Promise<void>;
  setPreset: (value: ThemePreset) => Promise<void>;
  setPlayerLayout: (value: PlayerLayout) => Promise<void>;
  setFontScale: (value: FontScale) => Promise<void>;
  setListDensity: (value: ListDensity) => Promise<void>;
  setCustomAccent: (value: string | null) => Promise<void>;
  setMagicColorEnabled: (value: boolean) => Promise<void>;
  setCustomBackgroundUri: (value: string | null) => Promise<void>;
  setBackgroundOpacity: (value: number) => Promise<void>;
  setGlassOpacity: (value: number) => Promise<void>;
}

const STORAGE_KEY = "hyacine.theme-preferences";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function migrateUiStyle(value: unknown): UiStyle {
  if (value === "liquid") return "liquid";
  if (value === "miui" || value === "miuix") return "miuix";
  if (value === "native") return "native";
  return "liquid";
}

function normalizePreferences(stored: Partial<ThemePreferences> & { uiStyle?: unknown }): ThemePreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    customAccent: stored.customAccent?.trim().toUpperCase() ?? null,
    uiStyle: migrateUiStyle(stored.uiStyle),
    customBackgroundUri: stored.customBackgroundUri?.trim() || null,
    backgroundOpacity: clamp01(stored.backgroundOpacity ?? DEFAULT_PREFERENCES.backgroundOpacity, DEFAULT_PREFERENCES.backgroundOpacity),
    glassOpacity: clamp01(stored.glassOpacity ?? DEFAULT_PREFERENCES.glassOpacity, DEFAULT_PREFERENCES.glassOpacity),
  };
}

export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const stored = JSON.parse(raw) as Partial<ThemePreferences> & { uiStyle?: unknown };
          setPreferences(normalizePreferences(stored));
        } catch {
          // Invalid local preferences are safely ignored.
        }
      }
      setHydrated(true);
    });
  }, []);

  const update = async (patch: Partial<ThemePreferences>): Promise<void> => {
    setPreferences((current) => {
      const next = normalizePreferences({ ...current, ...patch });
      void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const tokens = useMemo(() => {
    const base = PRESET_COLORS[preferences.preset];
    const accent = preferences.customAccent ?? base.accent;
    return withStyle(base, preferences.uiStyle, accent, preferences.glassOpacity);
  }, [preferences.customAccent, preferences.glassOpacity, preferences.preset, preferences.uiStyle]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preferences,
      tokens,
      hydrated,
      setUiStyle: (uiStyle) => update({ uiStyle }),
      setPreset: (preset) => update({ preset, customAccent: null }),
      setPlayerLayout: (playerLayout) => update({ playerLayout }),
      setFontScale: (fontScale) => update({ fontScale }),
      setListDensity: (listDensity) => update({ listDensity }),
      setCustomAccent: (customAccent) => update({ customAccent: customAccent?.trim().toUpperCase() ?? null }),
      setMagicColorEnabled: (magicColorEnabled) => update({ magicColorEnabled }),
      setCustomBackgroundUri: (customBackgroundUri) => update({ customBackgroundUri }),
      setBackgroundOpacity: (backgroundOpacity) => update({ backgroundOpacity: clamp01(backgroundOpacity, DEFAULT_PREFERENCES.backgroundOpacity) }),
      setGlassOpacity: (glassOpacity) => update({ glassOpacity: clamp01(glassOpacity, DEFAULT_PREFERENCES.glassOpacity) }),
    }),
    [hydrated, preferences, tokens],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}