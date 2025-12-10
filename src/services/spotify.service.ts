import type {
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifySearchResult,
  SpotifyTrack,
  SpotifyUser
} from "@/schemas/Spotify";
import { fetchWithAccessToken } from "./base.service";

// User Profile
export async function getUserProfile(): Promise<SpotifyUser | null> {
  const accessToken = localStorage.getItem("access_token");
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json() as Promise<SpotifyUser>;
}

// Top Artists
export async function getTopArtists(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit: number = 10
): Promise<SpotifyArtist[]> {
  const response = await fetchWithAccessToken(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch top artists");
  const data = await response.json();
  return data.items;
}

// Top Tracks
export async function getTopTracks(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit: number = 10
): Promise<SpotifyTrack[]> {
  const response = await fetchWithAccessToken(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch top tracks");
  const data = await response.json();
  return data.items;
}

// User Playlists
export async function getUserPlaylists(
  limit: number = 50
): Promise<SpotifyPlaylist[]> {
  const response = await fetchWithAccessToken(`/me/playlists?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch playlists");
  const data = await response.json();
  return data.items;
}

// Playlist Tracks
export async function getPlaylistTracks(
  playlistId: string,
  limit: number = 100
): Promise<SpotifyTrack[]> {
  const response = await fetchWithAccessToken(
    `/playlists/${playlistId}/tracks?limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch playlist tracks");
  const data = await response.json();
  // Extract track from the wrapper and filter out null tracks
  return data.items
    .map((item: { track: SpotifyTrack }) => item.track)
    .filter((track: SpotifyTrack) => track !== null);
}

export async function searchSpotify(
  query: string,
  type: Array<"artist" | "track" | "playlist">,
  limit: number = 10
): Promise<SpotifySearchResult | null> {
  const response = await fetchWithAccessToken(
    `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to search Spotify");
  const data = await response.json();
  return data;
}