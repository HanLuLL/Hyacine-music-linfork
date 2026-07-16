import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export const uiStyles = ["default", "frosted", "liquid", "miui"] as const;
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
  uiStyle: "default",
  preset: "daylight",
  playerLayout: "minimal",
  fontScale: "medium",
  listDensity: "comfortable",
  customAccent: null,
  magicColorEnabled: false,
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
    background: "#f7f7f5",
    backgroundSecondary: "#eeeeea",
    surface: "#ffffff",
    surfaceStrong: "#ffffff",
    surfaceBorder: "#deded8",
    primary: "#f7f7f5",
    accent: "#4e7a64",
    text: "#20211e",
    mutedText: "#777871",
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

function withStyle(base: Omit<ThemeTokens, "cardRadius" | "pillRadius" | "cardOpacity">, style: UiStyle, accent: string): ThemeTokens {
  const common = { ...base, accent };

  if (style === "miui") {
    return {
      ...common,
      surface: base.isLight ? "#ffffff" : "#262626",
      surfaceStrong: base.isLight ? "#ffffff" : "#202020",
      surfaceBorder: base.isLight ? "#d9dde5" : "#3f3f46",
      cardRadius: 28,
      pillRadius: 999,
      cardOpacity: 1,
    };
  }

  if (style === "frosted") {
    return {
      ...common,
      surface: base.isLight ? "#ffffff55" : "#ffffff0d",
      surfaceStrong: base.isLight ? "#ffffff8c" : "#11182788",
      surfaceBorder: base.isLight ? "#ffffffcc" : "#ffffff66",
      cardRadius: 24,
      pillRadius: 999,
      cardOpacity: 0.05,
    };
  }

  if (style === "liquid") {
    return {
      ...common,
      surface: base.isLight ? "#ffffff66" : "#ffffff12",
      surfaceStrong: base.isLight ? "#ffffffa6" : "#17213a99",
      surfaceBorder: base.isLight ? "#ffffffee" : "#ffffff88",
      cardRadius: 28,
      pillRadius: 999,
      cardOpacity: 0.08,
    };
  }

  return {
    ...common,
    surface: base.isLight ? "#ffffff" : "#ffffff26",
    surfaceStrong: base.isLight ? "#ffffff" : "#1b1836",
    surfaceBorder: base.isLight ? "#deded8" : "#ffffff33",
    cardRadius: 8,
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
}

const STORAGE_KEY = "hyacine.theme-preferences";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const stored = JSON.parse(raw) as Partial<ThemePreferences>;
          setPreferences({ ...DEFAULT_PREFERENCES, ...stored });
        } catch {
          // Invalid local preferences are safely ignored.
        }
      }
      setHydrated(true);
    });
  }, []);

  const update = async (patch: Partial<ThemePreferences>): Promise<void> => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const tokens = useMemo(() => {
    const base = PRESET_COLORS[preferences.preset];
    const accent = preferences.customAccent ?? base.accent;
    return withStyle(base, preferences.uiStyle, accent);
  }, [preferences.customAccent, preferences.preset, preferences.uiStyle]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preferences,
      tokens,
      hydrated,
      setUiStyle: (uiStyle) => update({ uiStyle }),
      setPreset: (preset) => update({ preset }),
      setPlayerLayout: (playerLayout) => update({ playerLayout }),
      setFontScale: (fontScale) => update({ fontScale }),
      setListDensity: (listDensity) => update({ listDensity }),
      setCustomAccent: (customAccent) => update({ customAccent }),
      setMagicColorEnabled: (magicColorEnabled) => update({ magicColorEnabled }),
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