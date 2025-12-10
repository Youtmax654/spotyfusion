export interface Track {
    id: string;
    name: string;
    artist: string;
    artistId: string;
    album: string;
    albumImageUrl: string | null;
    previewUrl: string | null;
    energyScore: number; // 0.0 - 1.0 (simulated)
}

export interface GenerateRecommendationsParams {
    seeds: string[];       // genres sélectionnés
    danceability: number;  // 0.0 - 1.0
    energy: number;        // 0.0 - 1.0
    valence: number;       // 0.0 - 1.0
    limit?: number;        // default 20-50
}

export interface RecommendationsError {
    status: number;
    message: string;
}
