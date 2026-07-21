export interface LiveUpdatesData {
  title: string;
  artist: string;
  artworkUrl?: string;
  isPlaying: boolean;
  position: number;
  duration: number;
}

declare global {
  interface ExpoModules {
    ExpoLiveUpdates: {
      startSession(title: string, artist: string, artworkUrl?: string): Promise<void>;
      updatePlaybackState(isPlaying: boolean, position: number, duration: number): Promise<void>;
      stopSession(): Promise<void>;
    };
  }
}

// Lazy-load the native module to avoid import-time crashes on platforms
// where the module is not installed (e.g. iOS, bare RN).
let _native: any = null;
function getNative(): any {
  if (_native !== null) return _native;
  try {
    const r = require("expo-modules-core");
    _native = r?.requireNativeModule?.("ExpoLiveUpdates") ?? null;
  } catch {
    _native = null;
  }
  return _native;
}

export const LiveUpdates = {
  async startSession(title: string, artist: string, artworkUrl?: string): Promise<void> {
    const mod = getNative();
    if (!mod) return;
    try { await mod.startSession(title, artist, artworkUrl); } catch {}
  },

  async updatePlaybackState(isPlaying: boolean, position: number, duration: number): Promise<void> {
    const mod = getNative();
    if (!mod) return;
    try { await mod.updatePlaybackState(isPlaying, position, duration); } catch {}
  },

  async stopSession(): Promise<void> {
    const mod = getNative();
    if (!mod) return;
    try { await mod.stopSession(); } catch {}
  }
};
