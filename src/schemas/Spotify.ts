export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  duration_ms: number;
  preview_url: string | null;
  is_playable?: boolean;
}

export interface TrackWithScore {
  track: SpotifyTrack;
  score: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
}

export interface SpotifyUser {
  display_name: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: {
    height: number;
    url: string;
    width: number;
  }[];
  type: string;
  uri: string;
  product: "free" | "premium";
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
}

export interface SpotifySearchResult {
  artists?: {
    items: SpotifyArtist[];
  };
  tracks?: {
    items: SpotifyTrack[];
  };
  playlists?: {
    items: SpotifyPlaylist[];
  };
}

export interface Seed {
  type: "artist" | "track" | "genre";
  id: string;
  name: string;
}

// Recommendation Service Types
export interface RecommendationTargets {
  danceability: number[];
  energy: number[];
  valence: number[];
}

export interface RecommendationOptions {
  targets: RecommendationTargets;
  seeds: Seed[];
  limit?: number;
  market?: string;
}