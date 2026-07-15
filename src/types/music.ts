export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  artwork?: string;
  trackCount: number;
}