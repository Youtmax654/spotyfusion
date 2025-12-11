import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getUserProfile,
    getTopArtists,
    getTopTracks,
    getUserPlaylists,
    getPlaylistTracks,
    searchSpotify,
    searchTracks,
    getArtists,
    getArtistTopTracks,
    getRecommendations,
    createPlaylist,
    addTracksToPlaylist,
} from '../services/spotify.service';
import {
    mockSpotifyUser,
    mockSpotifyArtist,
    mockSpotifyTrack,
    mockSpotifyPlaylist,
    createMockResponse,
    createMockErrorResponse,
} from '@/tests/mocks';

describe('getUserProfile', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch and return user profile', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockFetch = vi.fn().mockResolvedValue(
            createMockResponse(mockSpotifyUser)
        );
        vi.stubGlobal('fetch', mockFetch);

        const profile = await getUserProfile();

        expect(profile).toEqual(mockSpotifyUser);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me',
            expect.objectContaining({
                headers: { Authorization: 'Bearer test-token' },
            })
        );
    });

    it('should throw error if request fails', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockFetch = vi.fn().mockResolvedValue(createMockErrorResponse(401));
        vi.stubGlobal('fetch', mockFetch);

        await expect(getUserProfile()).rejects.toThrow('Failed to fetch user profile');
    });
});

describe('getTopArtists', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch top artists with default parameters', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [mockSpotifyArtist] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const artists = await getTopArtists();

        expect(artists).toEqual([mockSpotifyArtist]);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10',
            expect.any(Object)
        );
    });

    it('should fetch top artists with custom parameters', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [mockSpotifyArtist] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getTopArtists('short_term', 20);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=20',
            expect.any(Object)
        );
    });

    it('should throw error if request fails', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(createMockErrorResponse(500));
        vi.stubGlobal('fetch', mockFetch);

        await expect(getTopArtists()).rejects.toThrow('Failed to fetch top artists');
    });
});

describe('getTopTracks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch top tracks with default parameters', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [mockSpotifyTrack] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await getTopTracks();

        expect(tracks).toEqual([mockSpotifyTrack]);
    });

    it('should fetch top tracks with long_term range', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getTopTracks('long_term', 50);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',
            expect.any(Object)
        );
    });
});

describe('getUserPlaylists', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch user playlists', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [mockSpotifyPlaylist] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const playlists = await getUserPlaylists();

        expect(playlists).toEqual([mockSpotifyPlaylist]);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/playlists?limit=50',
            expect.any(Object)
        );
    });

    it('should respect custom limit', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getUserPlaylists(20);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('limit=20'),
            expect.any(Object)
        );
    });
});

describe('getPlaylistTracks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch playlist tracks and extract them from wrapper', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {
            items: [
                { track: mockSpotifyTrack },
                { track: { ...mockSpotifyTrack, id: 'track456' } },
            ],
        };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await getPlaylistTracks('playlist123');

        expect(tracks).toHaveLength(2);
        expect(tracks[0]).toEqual(mockSpotifyTrack);
    });

    it('should filter out null tracks', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {
            items: [
                { track: mockSpotifyTrack },
                { track: null },
                { track: { ...mockSpotifyTrack, id: 'track789' } },
            ],
        };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await getPlaylistTracks('playlist123');

        expect(tracks).toHaveLength(2);
        expect(tracks.every((t) => t !== null)).toBe(true);
    });

    it('should use correct endpoint with playlist ID', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { items: [] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getPlaylistTracks('myplaylist', 25);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/playlists/myplaylist/tracks?limit=25',
            expect.any(Object)
        );
    });
});

describe('searchSpotify', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should search for multiple types', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {
            tracks: { items: [mockSpotifyTrack] },
            artists: { items: [mockSpotifyArtist] },
        };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const results = await searchSpotify('rock', ['artist', 'track'], 10);

        expect(results).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('q=rock'),
            expect.any(Object)
        );
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('type=artist,track'),
            expect.any(Object)
        );
    });

    it('should encode special characters in query', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {};
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await searchSpotify('rock & roll', ['track']);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('q=rock%20%26%20roll'),
            expect.any(Object)
        );
    });
});

describe('searchTracks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should search for tracks and return items', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { tracks: { items: [mockSpotifyTrack] } };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await searchTracks('indie');

        expect(tracks).toEqual([mockSpotifyTrack]);
    });

    it('should return empty array if no tracks found', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { tracks: { items: [] } };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await searchTracks('nonexistent');

        expect(tracks).toEqual([]);
    });

    it('should handle missing tracks property', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {};
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await searchTracks('test');

        expect(tracks).toEqual([]);
    });
});

describe('getArtists', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch multiple artists by IDs', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { artists: [mockSpotifyArtist, { ...mockSpotifyArtist, id: 'artist456' }] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const artists = await getArtists(['artist123', 'artist456']);

        expect(artists).toHaveLength(2);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/artists?ids=artist123,artist456',
            expect.any(Object)
        );
    });

    it('should join artist IDs with commas', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { artists: [] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getArtists(['id1', 'id2', 'id3']);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('ids=id1,id2,id3'),
            expect.any(Object)
        );
    });
});

describe('getArtistTopTracks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should fetch artist top tracks with default market', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { tracks: [mockSpotifyTrack] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await getArtistTopTracks('artist123');

        expect(tracks).toEqual([mockSpotifyTrack]);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/artists/artist123/top-tracks?market=FR',
            expect.any(Object)
        );
    });

    it('should use custom market', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = { tracks: [] };
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        await getArtistTopTracks('artist123', 'US');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('market=US'),
            expect.any(Object)
        );
    });

    it('should return empty array if no tracks', async () => {
        localStorage.setItem('access_token', 'token');

        const mockData = {};
        const mockFetch = vi.fn().mockResolvedValue(createMockResponse(mockData));
        vi.stubGlobal('fetch', mockFetch);

        const tracks = await getArtistTopTracks('artist123');

        expect(tracks).toEqual([]);
    });
});

describe('createPlaylist', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should create a new playlist', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(
            createMockResponse(mockSpotifyPlaylist)
        );
        vi.stubGlobal('fetch', mockFetch);

        const playlist = await createPlaylist('user123', 'My Playlist', 'Test description');

        expect(playlist).toEqual(mockSpotifyPlaylist);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/users/user123/playlists',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                    name: 'My Playlist',
                    description: 'Test description',
                    public: false,
                }),
            })
        );
    });

    it('should create a public playlist', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(
            createMockResponse(mockSpotifyPlaylist)
        );
        vi.stubGlobal('fetch', mockFetch);

        await createPlaylist('user123', 'Public Playlist', undefined, true);

        const callArgs = (mockFetch as any).mock.calls[0][1];
        const body = JSON.parse(callArgs.body);

        expect(body.public).toBe(true);
    });

    it('should throw error if no access token', async () => {
        await expect(createPlaylist('user123', 'Test')).rejects.toThrow('No access token');
    });

    it('should throw error if request fails', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(createMockErrorResponse(403));
        vi.stubGlobal('fetch', mockFetch);

        await expect(createPlaylist('user123', 'Test')).rejects.toThrow(
            'Failed to create playlist'
        );
    });
});

describe('addTracksToPlaylist', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should add tracks to a playlist', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(createMockResponse({}));
        vi.stubGlobal('fetch', mockFetch);

        const trackUris = ['spotify:track:123', 'spotify:track:456'];
        await addTracksToPlaylist('playlist123', trackUris);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/playlists/playlist123/tracks',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ uris: trackUris }),
            })
        );
    });

    it('should throw error if no access token', async () => {
        await expect(addTracksToPlaylist('playlist123', [])).rejects.toThrow(
            'No access token'
        );
    });

    it('should throw error if request fails', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(createMockErrorResponse(404));
        vi.stubGlobal('fetch', mockFetch);

        await expect(
            addTracksToPlaylist('playlist123', ['spotify:track:123'])
        ).rejects.toThrow('Failed to add tracks to playlist');
    });
});

describe('getRecommendations', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return empty array if no candidates found', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue(
            createMockResponse({ tracks: { items: [] } })
        );
        vi.stubGlobal('fetch', mockFetch);

        const recommendations = await getRecommendations({
            targets: { danceability: [0.8], energy: [0.7], valence: [0.6] },
            seeds: [{ type: 'genre', name: 'nonexistent', id: 'nonexistent' }],
        });

        expect(recommendations).toEqual([]);
    });

    it('should fetch and rank recommendations from genre seeds', async () => {
        localStorage.setItem('access_token', 'token');

        const mockTracks = [
            mockSpotifyTrack,
            { ...mockSpotifyTrack, id: 'track2' },
            { ...mockSpotifyTrack, id: 'track3' },
        ];

        // Mock searchTracks
        const mockFetch = vi.fn()
            .mockResolvedValueOnce(createMockResponse({ tracks: { items: mockTracks } }))
            .mockResolvedValueOnce(createMockResponse({ artists: [mockSpotifyArtist] }));
        vi.stubGlobal('fetch', mockFetch);

        const recommendations = await getRecommendations({
            targets: { danceability: [0.8], energy: [0.7], valence: [0.6] },
            seeds: [{ type: 'genre', name: 'rock', id: 'rock' }],
            limit: 3,
        });

        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.length).toBeLessThanOrEqual(3);
        expect(recommendations[0]).toHaveProperty('track');
        expect(recommendations[0]).toHaveProperty('score');
        expect(recommendations[0].score).toBeGreaterThanOrEqual(1);
        expect(recommendations[0].score).toBeLessThanOrEqual(100);
    });

    it('should fetch recommendations from artist seeds', async () => {
        localStorage.setItem('access_token', 'token');

        // Mock getArtistTopTracks
        const mockFetch = vi.fn()
            .mockResolvedValueOnce(createMockResponse({ tracks: [mockSpotifyTrack] }))
            .mockResolvedValueOnce(createMockResponse({ artists: [mockSpotifyArtist] }));
        vi.stubGlobal('fetch', mockFetch);

        const recommendations = await getRecommendations({
            targets: { danceability: [0.5], energy: [0.5], valence: [0.5] },
            seeds: [{ type: 'artist', id: 'artist123', name: 'Test Artist' }],
            limit: 5,
        });

        expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should apply exponential decay scoring', async () => {
        localStorage.setItem('access_token', 'token');

        const mockTracks = Array.from({ length: 10 }, (_, i) => ({
            ...mockSpotifyTrack,
            id: `track${i}`,
        }));

        const mockFetch = vi.fn()
            .mockResolvedValueOnce(createMockResponse({ tracks: { items: mockTracks } }))
            .mockResolvedValueOnce(createMockResponse({ artists: Array(10).fill(mockSpotifyArtist) }));
        vi.stubGlobal('fetch', mockFetch);

        const recommendations = await getRecommendations({
            targets: { danceability: [0.7], energy: [0.8], valence: [0.5] },
            seeds: [{ type: 'genre', name: 'techno', id: 'techno' }],
            limit: 10,
        });

        // First track should have highest score
        expect(recommendations[0].score).toBeGreaterThan(recommendations[recommendations.length - 1].score);

        // Scores should be decreasing
        for (let i = 0; i < recommendations.length - 1; i++) {
            expect(recommendations[i].score).toBeGreaterThanOrEqual(recommendations[i + 1].score);
        }
    });

    it('should filter out non-playable tracks', async () => {
        localStorage.setItem('access_token', 'token');

        const mockTracks = [
            { ...mockSpotifyTrack, is_playable: true },
            { ...mockSpotifyTrack, id: 'track2', is_playable: false },
            { ...mockSpotifyTrack, id: 'track3', is_playable: true },
        ];

        const mockFetch = vi.fn()
            .mockResolvedValueOnce(createMockResponse({ tracks: { items: mockTracks } }))
            .mockResolvedValueOnce(createMockResponse({ artists: [mockSpotifyArtist] }));
        vi.stubGlobal('fetch', mockFetch);

        const recommendations = await getRecommendations({
            targets: { danceability: [0.5], energy: [0.5], valence: [0.5] },
            seeds: [{ type: 'genre', name: 'pop', id: 'pop' }],
        });

        // Should only include playable tracks
        recommendations.forEach((rec) => {
            expect(rec.track.is_playable).not.toBe(false);
        });
    });
});
