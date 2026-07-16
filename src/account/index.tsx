import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export interface AccountProfile {
  displayName: string;
  avatarUrl: string;
  backendUrl: string;
}

interface AccountContextValue {
  profile: AccountProfile | null;
  hydrated: boolean;
  saveProfile: (profile: AccountProfile) => Promise<void>;
}

const STORAGE_KEY = "hyacine.account-profile";
const AccountContext = createContext<AccountContextValue | null>(null);

function isComplete(value: Partial<AccountProfile>): value is AccountProfile {
  return Boolean(value.displayName?.trim() && value.avatarUrl?.trim() && value.backendUrl?.trim());
}

export function AccountProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<AccountProfile>;
          if (isComplete(saved)) setProfile(saved);
        } catch {
          // Invalid local account data is ignored.
        }
      }
      setHydrated(true);
    });
  }, []);

  const value = useMemo<AccountContextValue>(() => ({
    profile,
    hydrated,
    saveProfile: async (next) => {
      const normalized = {
        displayName: next.displayName.trim(),
        avatarUrl: next.avatarUrl.trim(),
        backendUrl: next.backendUrl.trim().replace(/\/$/, ""),
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(normalized));
      setProfile(normalized);
    },
  }), [hydrated, profile]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used inside AccountProvider");
  return context;
}