import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAccessToken, putPlayerRequest } from '../services/base.service';

describe('fetchWithAccessToken', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should throw an error if no access token exists', async () => {
        await expect(fetchWithAccessToken('/me')).rejects.toThrow('No access token');
    });

    it('should make a GET request with Authorization header', async () => {
        localStorage.setItem('access_token', 'test-token-123');

        const mockResponse = {
            ok: true,
            json: async () => ({ data: 'test' }),
        };

        const mockFetch = vi.fn().mockResolvedValue(mockResponse);
        vi.stubGlobal('fetch', mockFetch);

        const response = await fetchWithAccessToken('/me/playlists');

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/playlists',
            {
                headers: {
                    Authorization: 'Bearer test-token-123',
                },
            }
        );
        expect(response).toBe(mockResponse);
    });

    it('should construct the full URL correctly', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
        vi.stubGlobal('fetch', mockFetch);

        await fetchWithAccessToken('/me/top/artists?limit=10');

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/top/artists?limit=10',
            expect.any(Object)
        );
    });

    it('should return the response object for further processing', async () => {
        localStorage.setItem('access_token', 'token');

        const mockResponse = {
            ok: false,
            status: 404,
            json: async () => ({ error: 'Not found' }),
        };

        const mockFetch = vi.fn().mockResolvedValue(mockResponse);
        vi.stubGlobal('fetch', mockFetch);

        const response = await fetchWithAccessToken('/invalid-endpoint');

        expect(response.ok).toBe(false);
        expect(response.status).toBe(404);
    });
});

describe('putPlayerRequest', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return false if no access token exists', async () => {
        const result = await putPlayerRequest('/me/player/play');
        expect(result).toBe(false);
    });

    it('should make a PUT request without body', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 204,
        });
        vi.stubGlobal('fetch', mockFetch);

        const result = await putPlayerRequest('/me/player/pause');

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/pause',
            {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer test-token',
                },
            }
        );
        expect(result).toBe(true);
    });

    it('should make a PUT request with body', async () => {
        localStorage.setItem('access_token', 'test-token');

        const requestBody = { uris: ['spotify:track:123'] };

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 204,
        });
        vi.stubGlobal('fetch', mockFetch);

        const result = await putPlayerRequest('/me/player/play', requestBody);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/play',
            {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer test-token',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }
        );
        expect(result).toBe(true);
    });

    it('should return true for 204 status (No Content)', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 204,
        });
        vi.stubGlobal('fetch', mockFetch);

        const result = await putPlayerRequest('/me/player/volume?volume_percent=50');
        expect(result).toBe(true);
    });

    it('should return false if request fails', async () => {
        localStorage.setItem('access_token', 'token');

        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 403,
        });
        vi.stubGlobal('fetch', mockFetch);

        const result = await putPlayerRequest('/me/player/play');
        expect(result).toBe(false);
    });

    it('should handle JSON body correctly', async () => {
        localStorage.setItem('access_token', 'token');

        const body = { position_ms: 30000 };

        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal('fetch', mockFetch);

        await putPlayerRequest('/me/player/seek', body);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify(body),
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
            })
        );
    });
});
