import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export const audioQualities = ["standard", "higher", "exhigh", "lossless", "hires"] as const;
export type AudioQuality = (typeof audioQualities)[number];
export const soundPresets = ["flat", "bass", "vocal", "bright", "custom"] as const;
export type SoundPreset = (typeof soundPresets)[number];
export const equalizerBands = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000] as const;

interface AudioPreferences {
  quality: AudioQuality;
  preset: SoundPreset;
  equalizer: number[];
}
interface AudioPreferencesContextValue extends AudioPreferences {
  hydrated: boolean;
  setQuality: (quality: AudioQuality) => Promise<void>;
  setPreset: (preset: SoundPreset) => Promise<void>;
  setBand: (index: number, gain: number) => Promise<void>;
  resetEqualizer: () => Promise<void>;
}
const STORAGE_KEY = "hyacine.audio-preferences";
const defaults: AudioPreferences = { quality: "exhigh", preset: "flat", equalizer: equalizerBands.map(() => 0) };
const presetGains: Record<Exclude<SoundPreset, "custom">, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass: [6, 5, 3, 1, 0, 0, -1, -1, 0, 0],
  vocal: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
  bright: [-2, -1, 0, 0, 1, 2, 4, 5, 5, 4],
};
const Context = createContext<AudioPreferencesContextValue | null>(null);
function normalize(value: Partial<AudioPreferences>): AudioPreferences {
  const quality = audioQualities.includes(value.quality as AudioQuality) ? value.quality as AudioQuality : defaults.quality;
  const preset = soundPresets.includes(value.preset as SoundPreset) ? value.preset as SoundPreset : defaults.preset;
  const equalizer = Array.isArray(value.equalizer) && value.equalizer.length === equalizerBands.length
    ? value.equalizer.map((gain) => Math.max(-12, Math.min(12, Number(gain) || 0)))
    : defaults.equalizer;
  return { quality, preset, equalizer };
}
export function AudioPreferencesProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [preferences, setPreferences] = useState<AudioPreferences>(defaults);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { void SecureStore.getItemAsync(STORAGE_KEY).then((raw) => { if (raw) try { setPreferences(normalize(JSON.parse(raw))); } catch {} setHydrated(true); }); }, []);
  const update = async (patch: Partial<AudioPreferences>): Promise<void> => {
    setPreferences((current) => { const next = normalize({ ...current, ...patch }); void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)); return next; });
  };
  const value = useMemo<AudioPreferencesContextValue>(() => ({
    ...preferences,
    hydrated,
    setQuality: (quality) => update({ quality }),
    setPreset: (preset) => update({ preset, equalizer: preset === "custom" ? preferences.equalizer : presetGains[preset] }),
    setBand: (index, gain) => { const equalizer = [...preferences.equalizer]; equalizer[index] = gain; return update({ preset: "custom", equalizer }); },
    resetEqualizer: () => update({ preset: "flat", equalizer: presetGains.flat }),
  }), [hydrated, preferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAudioPreferences(): AudioPreferencesContextValue {
  const value = useContext(Context);
  if (!value) throw new Error("useAudioPreferences must be used inside AudioPreferencesProvider");
  return value;
}
