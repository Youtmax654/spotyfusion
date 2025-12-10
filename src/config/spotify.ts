export const spotifyConfig = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || "",
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || "",
  scopes: [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ].join(" "),
};

export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

if (!spotifyConfig.clientId || !spotifyConfig.redirectUri) {
  console.error(
    "Spotify configuration is missing. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_REDIRECT_URI in your environment variables."
  );
}
