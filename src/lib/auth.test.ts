import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, refreshAccessToken } from './auth';

describe('getAccessToken', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return the access token from localStorage if it exists', () => {
        localStorage.setItem('access_token', 'test-token-123');
        expect(getAccessToken()).toBe('test-token-123');
    });

    it('should return null if no access token exists', () => {
        expect(getAccessToken()).toBeNull();
    });

    it('should return the updated token if localStorage changes', () => {
        localStorage.setItem('access_token', 'token-1');
        expect(getAccessToken()).toBe('token-1');

        localStorage.setItem('access_token', 'token-2');
        expect(getAccessToken()).toBe('token-2');
    });
});

describe('refreshAccessToken', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should throw an error if no refresh token is available', async () => {
        await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
    });

    it('should successfully refresh the access token', async () => {
        localStorage.setItem('refresh_token', 'refresh-token-123');

        const mockResponse = {
            ok: true,
            json: async () => ({ access_token: 'new-access-token-456' }),
        };

        const mockFetch = vi.fn().mockResolvedValue(mockResponse);
        vi.stubGlobal('fetch', mockFetch);

        const newToken = await refreshAccessToken();

        expect(newToken).toBe('new-access-token-456');
        expect(localStorage.getItem('access_token')).toBe('new-access-token-456');
        expect(mockFetch).toHaveBeenCalledWith('/api/spotify/refresh_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: 'refresh-token-123' }),
        });
    });

    it('should throw an error if the refresh request fails', async () => {
        localStorage.setItem('refresh_token', 'refresh-token-123');

        const mockResponse = {
            ok: false,
            json: async () => ({ error: 'Invalid refresh token' }),
        };

        const mockFetch = vi.fn().mockResolvedValue(mockResponse);
        vi.stubGlobal('fetch', mockFetch);

        await expect(refreshAccessToken()).rejects.toThrow('Failed to refresh access token');
    });

    it('should use the refresh token from localStorage', async () => {
        localStorage.setItem('refresh_token', 'specific-refresh-token');

        const mockResponse = {
            ok: true,
            json: async () => ({ access_token: 'new-token' }),
        };

        const mockFetch = vi.fn().mockResolvedValue(mockResponse);
        vi.stubGlobal('fetch', mockFetch);

        await refreshAccessToken();

        expect(mockFetch).toHaveBeenCalledWith(
            '/api/spotify/refresh_token',
            expect.objectContaining({
                body: JSON.stringify({ refresh_token: 'specific-refresh-token' }),
            })
        );
    });
});
