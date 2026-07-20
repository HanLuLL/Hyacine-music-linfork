// @ts-ignore - native module
const NativeModule = (globalThis as any).ExpoFluidCloud;

export interface NowPlayingData {
  title: string;
  artist: string;
  progress?: number;
  duration?: number;
  isPlaying?: boolean;
  coverUrl?: string;
}

export const FluidCloud = {
  async isAvailable(): Promise<boolean> {
    try { return await NativeModule.isAvailable(); } catch { return false; }
  },
  async updateNowPlaying(data: NowPlayingData): Promise<void> {
    try { await NativeModule.updateNowPlaying(data); } catch {}
  },
  async removeNowPlaying(): Promise<void> {
    try { await NativeModule.removeNowPlaying(); } catch {}
  },
};