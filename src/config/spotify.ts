export const spotifyConfig = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || "",
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || "",
};

if (!spotifyConfig.clientId || !spotifyConfig.redirectUri) {
  console.error(
    "Spotify configuration is missing. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_REDIRECT_URI in your environment variables."
  );
}