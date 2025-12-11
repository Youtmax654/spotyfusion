import type {
    SpotifyUser,
    SpotifyTrack,
    SpotifyArtist,
    SpotifyPlaylist,
} from '@/schemas/Spotify';

// Mock Spotify User
export const mockSpotifyUser: SpotifyUser = {
    id: 'user123',
    display_name: 'Test User',
    images: [{ url: 'https://example.com/avatar.jpg', height: 64, width: 64 }],
    followers: { href: 'https://api.spotify.com/v1/users/user123/followers', total: 100 },
    product: 'premium',
    uri: 'spotify:user:user123',
    href: 'https://api.spotify.com/v1/users/user123',
    external_urls: { spotify: 'https://open.spotify.com/user/user123' },
    type: 'user',
};

// Mock Spotify Artist
export const mockSpotifyArtist: SpotifyArtist = {
    id: 'artist123',
    name: 'Test Artist',
    genres: ['rock', 'indie'],
    images: [{ url: 'https://example.com/artist.jpg', height: 640, width: 640 }],
};

// Mock Spotify Track
export const mockSpotifyTrack: SpotifyTrack = {
    id: 'track123',
    name: 'Test Track',
    artists: [mockSpotifyArtist],
    album: {
        name: 'Test Album',
        images: [{ url: 'https://example.com/album.jpg', height: 640, width: 640 }],
    },
    duration_ms: 210000,
    preview_url: 'https://example.com/preview.mp3',
};

// Mock Spotify Playlist
export const mockSpotifyPlaylist: SpotifyPlaylist = {
    id: 'playlist123',
    name: 'Test Playlist',
    images: [{ url: 'https://example.com/playlist.jpg', height: 640, width: 640 }],
    tracks: {
        total: 25,
    },
};

// Helper to create mock fetch response
export const createMockResponse = <T>(data: T, ok = true, status = 200) => {
    return Promise.resolve({
        ok,
        status,
        json: async () => data,
    } as Response);
};

// Helper to create mock error response
export const createMockErrorResponse = (status = 500, statusText = 'Internal Server Error') => {
    return Promise.resolve({
        ok: false,
        status,
        statusText,
        json: async () => ({ error: statusText }),
    } as Response);
};
