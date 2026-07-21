import { Platform } from 'react-native';
import { LiveUpdates } from '../../modules/expo-live-updates/src';
import { appLog } from '@/utils/logger';

export interface LiveUpdatesData {
  title: string;
  artist: string;
  artworkUrl?: string;
  isPlaying: boolean;
  position: number;
  duration: number;
}

let isSessionStarted = false;

export async function startLiveUpdatesSession(data: LiveUpdatesData): Promise<void> {
  if (Platform.OS !== 'android') return;
  
  try {
    await LiveUpdates.startSession(data.title, data.artist, data.artworkUrl);
    isSessionStarted = true;
    appLog.info('live-updates', 'session started', { title: data.title });
  } catch (e) {
    appLog.warn('live-updates', 'startSession failed', { error: String(e) });
  }
}

export async function updateLiveUpdatesPlaybackState(data: LiveUpdatesData): Promise<void> {
  if (Platform.OS !== 'android' || !isSessionStarted) return;
  
  try {
    await LiveUpdates.updatePlaybackState(data.isPlaying, data.position, data.duration);
  } catch (e) {
    appLog.warn('live-updates', 'updatePlaybackState failed', { error: String(e) });
  }
}

export async function stopLiveUpdatesSession(): Promise<void> {
  if (Platform.OS !== 'android' || !isSessionStarted) return;
  
  try {
    await LiveUpdates.stopSession();
    isSessionStarted = false;
    appLog.info('live-updates', 'session stopped');
  } catch (e) {
    appLog.warn('live-updates', 'stopSession failed', { error: String(e) });
  }
}
