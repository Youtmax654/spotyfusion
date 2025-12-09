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
    artists: { name: string }[];
    album: {
        name: string;
        images: SpotifyImage[];
    };
    duration_ms: number;
    preview_url: string | null;
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
    id: string;
    display_name: string;
    email: string;
    images: SpotifyImage[];
    product: string; // 'premium' | 'free'
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
