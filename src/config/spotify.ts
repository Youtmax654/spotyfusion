// Spotify API Configuration
export const SPOTIFY_CONFIG = {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID as string,
    redirectUri: import.meta.env.VITE_REDIRECT_URI as string,
    authEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'playlist-read-private',
        'playlist-read-collaborative',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state',
    ].join(' '),
};
