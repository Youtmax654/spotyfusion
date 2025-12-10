import type { User } from "@/schemas/User";
import type { Track, GenerateRecommendationsParams, RecommendationsError } from "@/schemas/Recommendations";

export const spotifyService = {
    getUserProfile: async (): Promise<User | null> => {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        return data as User;
    },

    // Générer des recommandations
    generateRecommendations: async (params: GenerateRecommendationsParams): Promise<Track[]> => {
        const accessToken = localStorage.getItem("access_token");

        // Validation au moins 1 genre(seed) requis
        if (!params.seeds || params.seeds.length === 0) {
            const error: RecommendationsError = {
                status: 400,
                message: "Au moins un genre (seed) est requis pour générer des recommandations."
            };
            throw error;
        }

        // Valider les valeurs des paramètres audio (au cas où le curseur dépasse les limites)
        if (params.danceability < 0 || params.danceability > 1 ||
            params.energy < 0 || params.energy > 1 ||
            params.valence < 0 || params.valence > 1) {
            const error: RecommendationsError = {
                status: 400,
                message: "Les paramètres audio doivent être compris entre 0 et 1."
            };
            throw error;
        }

        const limit = params.limit || 30;
        const allTracks: Track[] = [];

        // Rechercher des tracks pour chaque genre sélectionné
        for (const genre of params.seeds) {
            const query = encodeURIComponent(`genre:${genre.toLowerCase()}`);
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${Math.ceil(limit / params.seeds.length)}&market=FR`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 400) {
                    const error: RecommendationsError = {
                        status: 400,
                        message: "Combinaison de paramètres invalide. Veuillez ajuster vos critères."
                    };
                    throw error;
                }
                continue;
            }

            const data = await response.json();

            if (data.tracks?.items) {
                for (const item of data.tracks.items) {
                    // Simulation score d'énergie aléatoire
                    const variation = (Math.random() - 0.5) * 0.3;
                    const simulatedEnergy = Math.max(0, Math.min(1, params.energy + variation));

                    const track: Track = {
                        id: item.id,
                        name: item.name,
                        artist: item.artists?.map((a: { name: string }) => a.name).join(", ") || "Unknown Artist",
                        artistId: item.artists?.[0]?.id || "",
                        album: item.album?.name || "Unknown Album",
                        albumImageUrl: item.album?.images?.[0]?.url || null,
                        previewUrl: item.preview_url || null,
                        energyScore: Math.round(simulatedEnergy * 100) / 100,
                    };
                    allTracks.push(track);
                }
            }
        }

        //Afficher les tracks randoms
        const shuffled = allTracks.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(limit, 50));
    },

    //Sauvegarde des tracks dans la playlist
    // Créer une playlist
    createPlaylist: async (userId: string, name: string, description?: string): Promise<{ id: string; url: string }> => {
        const accessToken = localStorage.getItem("access_token");

        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                description: description || "Playlist générée par SpotyFusion",
                public: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                message: errorData.error?.message || "Impossible de créer la playlist.",
            };
        }

        const data = await response.json();
        return {
            id: data.id,
            url: data.external_urls?.spotify || "",
        };
    },

    // Ajouter des tracks à une playlist
    addTracksToPlaylist: async (playlistId: string, trackIds: string[]): Promise<void> => {
        const accessToken = localStorage.getItem("access_token");

        const uris = trackIds.map(id => `spotify:track:${id}`);

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                message: errorData.error?.message || "Impossible d'ajouter les titres à la playlist.",
            };
        }
    },

    // Sauvegarder une playlist complète (créer + ajouter tracks)
    savePlaylist: async (userId: string, name: string, tracks: Track[], description?: string): Promise<{ playlistId: string; playlistUrl: string; tracksAdded: number }> => {
        // 1. Créer la playlist
        const playlist = await spotifyService.createPlaylist(userId, name, description);

        // 2. Ajouter les tracks
        const trackIds = tracks.map(t => t.id);
        await spotifyService.addTracksToPlaylist(playlist.id, trackIds);

        return {
            playlistId: playlist.id,
            playlistUrl: playlist.url,
            tracksAdded: tracks.length,
        };
    },
}
