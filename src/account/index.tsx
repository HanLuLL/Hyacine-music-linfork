import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export type MusicSource = "netease" | "bilibili";
export interface AccountProfile { displayName: string; avatarUrl: string; backendUrl: string; musicSource: MusicSource | null; }
interface AccountContextValue { profile: AccountProfile | null; hydrated: boolean; saveProfile: (profile: AccountProfile) => Promise<void>; saveSourceCredential: (source: MusicSource, credential: string) => Promise<void>; getSourceCredential: (source: MusicSource) => Promise<string | null>; }
const STORAGE_KEY = "hyacine.account-profile";
const credentialKey = (source: MusicSource): string => `hyacine.music-source.${source}`;
const AccountContext = createContext<AccountContextValue | null>(null);

function readProfile(value: Partial<AccountProfile>): AccountProfile | null {
  if (!value.displayName?.trim() || !value.backendUrl?.trim()) return null;
  return { displayName: value.displayName, avatarUrl: value.avatarUrl?.trim() ?? "", backendUrl: value.backendUrl, musicSource: value.musicSource ?? null };
}

export function AccountProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { void SecureStore.getItemAsync(STORAGE_KEY).then((raw) => { if (raw) try { setProfile(readProfile(JSON.parse(raw) as Partial<AccountProfile>)); } catch {} setHydrated(true); }); }, []);
  const value = useMemo<AccountContextValue>(() => ({ profile, hydrated,
    saveProfile: async (next) => { const normalized = { displayName: next.displayName.trim(), avatarUrl: next.avatarUrl.trim(), backendUrl: next.backendUrl.trim().replace(/\/$/, ""), musicSource: next.musicSource }; await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(normalized)); setProfile(normalized); },
    saveSourceCredential: async (source, credential) => { await SecureStore.setItemAsync(credentialKey(source), credential); const next = profile ? { ...profile, musicSource: source } : null; if (next) { await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)); setProfile(next); } },
    getSourceCredential: (source) => SecureStore.getItemAsync(credentialKey(source)),
  }), [hydrated, profile]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
export function useAccount(): AccountContextValue { const context = useContext(AccountContext); if (!context) throw new Error("useAccount must be used inside AccountProvider"); return context; }