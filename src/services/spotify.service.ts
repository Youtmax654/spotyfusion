import type {
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifySearchResult,
  SpotifyTrack,
  SpotifyUser
} from "@/schemas/Spotify";
import { fetchWithAccessToken } from "./base.service";
import { SPOTIFY_API_BASE } from "@/config/spotify";

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

// Get multiple artists by IDs (max 50 per request)
export async function getArtists(
  artistIds: string[]
): Promise<SpotifyArtist[]> {
  const ids = artistIds.join(",");
  const response = await fetchWithAccessToken(`/artists?ids=${ids}`);
  if (!response.ok) throw new Error("Failed to fetch artists");
  const data = await response.json();
  return data.artists;
}

// Search for tracks with complex queries (genre-based)
export async function searchTracks(
  query: string,
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const response = await fetchWithAccessToken(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to search tracks");
  const data = await response.json();
  return data.tracks?.items || [];
}

// Get artist's top tracks for a specific market
export async function getArtistTopTracks(
  artistId: string,
  market: string = "FR"
): Promise<SpotifyTrack[]> {
  const response = await fetchWithAccessToken(
    `/artists/${artistId}/top-tracks?market=${market}`
  );
  if (!response.ok) throw new Error("Failed to fetch artist top tracks");
  const data = await response.json();
  return data.tracks || [];
}

// --- Recommendation Service ---

// Genre-to-Audio-Features mapping (Vibe Map)
const GENRE_VIBE_MAP: Record<string, import("@/schemas/Spotify").RecommendationTargets> = {
  techno: { danceability: [0.8], energy: [0.9], valence: [0.5] },
  house: { danceability: [0.8], energy: [0.8], valence: [0.7] },
  edm: { danceability: [0.7], energy: [0.9], valence: [0.6] },
  dubstep: { danceability: [0.6], energy: [0.9], valence: [0.4] },
  "hip-hop": { danceability: [0.8], energy: [0.6], valence: [0.6] },
  rap: { danceability: [0.8], energy: [0.7], valence: [0.5] },
  trap: { danceability: [0.7], energy: [0.8], valence: [0.3] },
  pop: { danceability: [0.7], energy: [0.7], valence: [0.7] },
  rock: { danceability: [0.4], energy: [0.8], valence: [0.5] },
  metal: { danceability: [0.3], energy: [0.95], valence: [0.2] },
  punk: { danceability: [0.5], energy: [0.9], valence: [0.4] },
  indie: { danceability: [0.6], energy: [0.5], valence: [0.6] },
  folk: { danceability: [0.4], energy: [0.3], valence: [0.5] },
  acoustic: { danceability: [0.4], energy: [0.2], valence: [0.5] },
  classical: { danceability: [0.1], energy: [0.2], valence: [0.3] },
  jazz: { danceability: [0.6], energy: [0.4], valence: [0.6] },
  ambient: { danceability: [0.2], energy: [0.1], valence: [0.2] },
  latin: { danceability: [0.8], energy: [0.7], valence: [0.8] },
  reggaeton: { danceability: [0.9], energy: [0.7], valence: [0.8] },
  default: { danceability: [0.5], energy: [0.5], valence: [0.5] },
};

// Estimate audio features from artist genres
function estimateFeaturesFromGenres(
  genres: string[]
): import("@/schemas/Spotify").RecommendationTargets {
  if (!genres || genres.length === 0) return GENRE_VIBE_MAP["default"];

  let totalDance = 0,
    totalEnergy = 0,
    totalValence = 0;
  let matchCount = 0;

  genres.forEach((genre) => {
    const key = Object.keys(GENRE_VIBE_MAP).find((k) => genre.includes(k));
    if (key) {
      const stats = GENRE_VIBE_MAP[key];
      totalDance += stats.danceability[0];
      totalEnergy += stats.energy[0];
      totalValence += stats.valence[0];
      matchCount++;
    }
  });

  if (matchCount === 0) return GENRE_VIBE_MAP["default"];

  return {
    danceability: [totalDance / matchCount],
    energy: [totalEnergy / matchCount],
    valence: [totalValence / matchCount],
  };
}

// Enrich tracks with estimated audio features based on artist genres
async function enrichTracksWithEstimatedFeatures(
  tracks: SpotifyTrack[]
): Promise<
  Array<{
    track: SpotifyTrack;
    features: import("@/schemas/Spotify").RecommendationTargets;
  }>
> {
  // Extract unique artist IDs
  const artistIds = new Set<string>();
  tracks.forEach((t) => {
    if (t.artists && t.artists.length > 0) artistIds.add(t.artists[0].id);
  });

  const artistIdsArray = Array.from(artistIds);
  const artistGenreMap = new Map<string, string[]>();

  // Fetch artists in chunks of 50
  for (let i = 0; i < artistIdsArray.length; i += 50) {
    const chunk = artistIdsArray.slice(i, i + 50);
    try {
      const artists = await getArtists(chunk);
      artists.forEach((artist) => {
        artistGenreMap.set(artist.id, artist.genres);
      });
    } catch (err) {
      console.error("Error fetching artists:", err);
    }
  }

  // Associate each track with estimated features
  return tracks.map((track) => {
    const mainArtistId = track.artists[0]?.id;
    const genres = artistGenreMap.get(mainArtistId) || [];
    const estimatedFeatures = estimateFeaturesFromGenres(genres);

    return {
      track,
      features: estimatedFeatures,
    };
  });
}

// Rank tracks by Euclidean distance to target features
function rankTracksByEstimatedRelevance(
  items: Array<{
    track: SpotifyTrack;
    features: import("@/schemas/Spotify").RecommendationTargets;
  }>,
  targets: import("@/schemas/Spotify").RecommendationTargets
) {
  return items
    .map((item) => {
      const distance = Math.sqrt(
        Math.pow(item.features.danceability[0] - targets.danceability[0], 2) +
        Math.pow(item.features.energy[0] - targets.energy[0], 2) +
        Math.pow(item.features.valence[0] - targets.valence[0], 2)
      );
      return { ...item, score: distance };
    })
    .sort((a, b) => a.score - b.score);
}

// Fetch candidate tracks from genres
async function fetchCandidatesFromGenres(
  genres: string[] | undefined,
  map: Map<string, SpotifyTrack>
) {
  if (!genres || genres.length === 0) return;
  const query = genres.map((g) => `genre:${g}`).join(" OR ");
  try {
    const tracks = await searchTracks(query, 50);
    tracks.forEach((t) => {
      if (t.is_playable !== false) map.set(t.id, t);
    });
  } catch (e) {
    console.error("Error searching tracks:", e);
  }
}

// Fetch candidate tracks from artists
async function fetchCandidatesFromArtists(
  artistIds: string[] | undefined,
  market: string = "FR",
  map: Map<string, SpotifyTrack>
) {
  if (!artistIds || artistIds.length === 0) return;
  const promises = artistIds.map(async (id) => {
    try {
      const tracks = await getArtistTopTracks(id, market);
      tracks.forEach((t) => {
        if (t.is_playable !== false) map.set(t.id, t);
      });
    } catch (e) {
      console.error("Error fetching artist top tracks:", e);
    }
  });
  await Promise.all(promises);
}

// Main recommendation function
export async function getRecommendations(
  options: import("@/schemas/Spotify").RecommendationOptions
): Promise<import("@/schemas/Spotify").TrackWithScore[]> {
  const { targets, seeds, limit = 20, market = "FR" } = options;

  const candidateMap = new Map<string, SpotifyTrack>();

  // Parse seeds by type
  const genres = seeds
    .filter((seed) => seed.type === "genre")
    .map((seed) => seed.name);

  const artistIds = seeds
    .filter((seed) => seed.type === "artist")
    .map((seed) => seed.id);

  // 1. Fetch candidate tracks
  await Promise.all([
    fetchCandidatesFromGenres(genres, candidateMap),
    fetchCandidatesFromArtists(artistIds, market, candidateMap),
  ]);

  if (candidateMap.size === 0) {
    console.warn("No candidates found! Check if seeds exist and API is working.");
    return [];
  }

  const allCandidates = Array.from(candidateMap.values());

  // 2. Enrich with estimated features
  const enrichedTracks = await enrichTracksWithEstimatedFeatures(allCandidates);

  // 3. Rank by relevance
  const sortedTracks = rankTracksByEstimatedRelevance(enrichedTracks, targets);

  // 4. Return top results with meaningful scores (0-100)
  const topTracks = sortedTracks.slice(0, limit);

  if (topTracks.length === 0) return [];

  // Use exponential decay for better score distribution
  // Best match gets 100, scores decay exponentially
  return topTracks.map((item, index) => {
    // Exponential decay: score = 100 * e^(-k * rank)
    // where k controls decay rate (0.05 gives good distribution)
    const score = Math.round(100 * Math.exp(-0.05 * index));

    return {
      track: item.track,
      score: Math.max(1, score) // Minimum score of 1
    };
  });
}

// Create a new playlist
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  isPublic: boolean = false
): Promise<SpotifyPlaylist> {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    throw new Error("No access token");
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create playlist");
  }

  return response.json() as Promise<SpotifyPlaylist>;
}

// Add tracks to a playlist
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    throw new Error("No access token");
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add tracks to playlist");
  }
}