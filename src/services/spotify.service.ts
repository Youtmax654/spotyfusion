import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyUser,
  RecentlyPlayedItem,
  SpotifyDevice,
} from "@/schemas/Spotify";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function fetchWithAccessToken(endpoint: string): Promise<Response> {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}

export const spotifyService = {
  getUserProfile: async (): Promise<SpotifyUser | null> => {
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return response.json() as Promise<SpotifyUser>;
  },
  getTopArtists: async (
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 10
  ): Promise<SpotifyArtist[]> => {
    const response = await fetchWithAccessToken(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch top artists");
    const data = await response.json();
    return data.items;
  },
  getTopTracks: async (
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 10
  ): Promise<SpotifyTrack[]> => {
    const response = await fetchWithAccessToken(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch top tracks");
    const data = await response.json();
    return data.items;
  },
  getRecentlyPlayed: async (
    limit: number = 5
  ): Promise<RecentlyPlayedItem[]> => {
    const response = await fetchWithAccessToken(
      `/me/player/recently-played?limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch recently played");
    const data = await response.json();
    return data.items;
  },
  getUserPlaylists: async (limit: number = 50): Promise<SpotifyPlaylist[]> => {
    const response = await fetchWithAccessToken(`/me/playlists?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch playlists");
    const data = await response.json();
    return data.items;
  },
  getPlaylistTracks: async (
    playlistId: string,
    limit: number = 100
  ): Promise<SpotifyTrack[]> => {
    const response = await fetchWithAccessToken(
      `/playlists/${playlistId}/tracks?limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch playlist tracks");
    const data = await response.json();
    // Extract track from the wrapper and filter out null tracks
    return data.items
      .map((item: { track: SpotifyTrack }) => item.track)
      .filter((track: SpotifyTrack) => track !== null);
  },
  getAvailableDevices: async (): Promise<SpotifyDevice[]> => {
    const response = await fetchWithAccessToken("/me/player/devices");
    if (!response.ok) throw new Error("Failed to fetch devices");
    const data = await response.json();
    return data.devices;
  },
  playTrack: async (trackUri: string, deviceId?: string): Promise<boolean> => {
    const endpoint = deviceId
      ? `/me/player/play?device_id=${deviceId}`
      : "/me/player/play";

    return putPlayerRequest(endpoint, { uris: [trackUri], position_ms: 0 });
  },
  pausePlayback: async (): Promise<boolean> => {
    return putPlayerRequest("/me/player/pause");
  },
  transferPlayback: async (deviceId: string): Promise<boolean> => {
    return putPlayerRequest("/me/player", {
      device_ids: [deviceId],
      play: false,
    });
  },
};

// Spotify Playback Control (requires Premium)
// Helper for PUT requests to Spotify player API
async function putPlayerRequest(
  endpoint: string,
  body?: object
): Promise<boolean> {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return false;

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body && { "Content-Type": "application/json" }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  return response.ok || response.status === 204;
}
