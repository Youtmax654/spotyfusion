import { getAccessToken, refreshAccessToken } from './spotifyAuth';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyImage {
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

async function fetchWithAuth(endpoint: string): Promise<Response> {
    let token = getAccessToken();

    if (!token) {
        throw new Error('No access token');
    }

    let response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // If token expired, try to refresh
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            token = getAccessToken();
            response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    }

    return response;
}

export async function getCurrentUser(): Promise<SpotifyUser> {
    const response = await fetchWithAuth('/me');
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
}

export async function getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 10
): Promise<SpotifyArtist[]> {
    const response = await fetchWithAuth(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch top artists');
    const data = await response.json();
    return data.items;
}

export async function getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 10
): Promise<SpotifyTrack[]> {
    const response = await fetchWithAuth(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch top tracks');
    const data = await response.json();
    return data.items;
}

export async function getRecentlyPlayed(limit: number = 5): Promise<RecentlyPlayedItem[]> {
    const response = await fetchWithAuth(`/me/player/recently-played?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recently played');
    const data = await response.json();
    return data.items;
}

export async function getUserPlaylists(limit: number = 50): Promise<SpotifyPlaylist[]> {
    const response = await fetchWithAuth(`/me/playlists?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch playlists');
    const data = await response.json();
    return data.items;
}

export async function getPlaylistTracks(playlistId: string, limit: number = 100): Promise<SpotifyTrack[]> {
    const response = await fetchWithAuth(`/playlists/${playlistId}/tracks?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch playlist tracks');
    const data = await response.json();
    // Extract track from the wrapper and filter out null tracks
    return data.items
        .map((item: { track: SpotifyTrack }) => item.track)
        .filter((track: SpotifyTrack) => track !== null);
}

// Spotify Playback Control (requires Premium)
export interface SpotifyDevice {
    id: string;
    is_active: boolean;
    name: string;
    type: string;
}

export async function getAvailableDevices(): Promise<SpotifyDevice[]> {
    const response = await fetchWithAuth('/me/player/devices');
    if (!response.ok) throw new Error('Failed to fetch devices');
    const data = await response.json();
    return data.devices;
}

export async function playTrack(trackUri: string, deviceId?: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const endpoint = deviceId
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: [trackUri],
            position_ms: 0,
        }),
    });

    return response.ok || response.status === 204;
}

export async function pausePlayback(): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    return response.ok || response.status === 204;
}

export async function transferPlayback(deviceId: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;

    const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            device_ids: [deviceId],
            play: false,
        }),
    });

    return response.ok || response.status === 204;
}
