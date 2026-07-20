export interface NowPlayingData {
  title: string;
  artist: string;
  album?: string;
  progress?: number;
  duration?: number;
  isPlaying?: boolean;
  coverUrl?: string;
  lyrics?: string;
  supportPlayPause?: boolean;
  supportNext?: boolean;
  supportPrev?: boolean;
  supportSeek?: boolean;
}

declare global {
  interface ExpoModules {
    ExpoFluidCloud: {
      isAvailable(): Promise<boolean>;
      updateNowPlaying(data: NowPlayingData): Promise<void>;
      removeNowPlaying(): Promise<void>;
    };
  }
}

// Lazy-load the native module to avoid import-time crashes on platforms
// where the module is not installed (e.g. iOS, bare RN).
let _native: any = null;
function getNative(): any {
  if (_native !== null) return _native;
  try {
    // Resolve via ExpoModulesCore on Android; falls back to undefined elsewhere.
    const r = require("expo-modules-core");
    _native = r?.requireNativeModule?.("ExpoFluidCloud") ?? null;
  } catch {
    _native = null;
  }
  return _native;
}

export const FluidCloud = {
  async isAvailable(): Promise<boolean> {
    const mod = getNative();
    if (!mod) return false;
    try { return await mod.isAvailable(); } catch { return false; }
  },
  async updateNowPlaying(data: NowPlayingData): Promise<void> {
    const mod = getNative();
    if (!mod) return;
    try { await mod.updateNowPlaying(data); } catch {}
  },
  async removeNowPlaying(): Promise<void> {
    const mod = getNative();
    if (!mod) return;
    try { await mod.removeNowPlaying(); } catch {}
  },
};