import { SPOTIFY_CONFIG } from '../config/spotify';

// Generate a random string for PKCE code verifier
function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate code challenge from verifier using SHA-256
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Redirect user to Spotify authorization page
export async function loginWithSpotify(): Promise<void> {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const params = new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        response_type: 'code',
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        scope: SPOTIFY_CONFIG.scopes,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });

    window.location.href = `${SPOTIFY_CONFIG.authEndpoint}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function handleSpotifyCallback(code: string): Promise<boolean> {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');

    if (!codeVerifier) {
        console.error('No code verifier found');
        return false;
    }

    try {
        const response = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: SPOTIFY_CONFIG.clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: SPOTIFY_CONFIG.redirectUri,
                code_verifier: codeVerifier,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Token exchange failed:', errorData);
            return false;
        }

        const data = await response.json();

        // Store tokens
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        localStorage.setItem('spotify_token_expires_at', String(Date.now() + data.expires_in * 1000));

        // Clean up code verifier
        localStorage.removeItem('spotify_code_verifier');

        return true;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return false;
    }
}

// Get the current access token
export function getAccessToken(): string | null {
    const expiresAt = localStorage.getItem('spotify_token_expires_at');

    if (expiresAt && Date.now() > parseInt(expiresAt)) {
        // Token expired, should refresh
        return null;
    }

    return localStorage.getItem('spotify_access_token');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
    return getAccessToken() !== null;
}

// Logout user
export function logout(): void {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
    localStorage.removeItem('spotify_code_verifier');
    // Clear cached stats data
    sessionStorage.removeItem('spotyfusion_recently_played');
}

// Refresh the access token
export async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: SPOTIFY_CONFIG.clientId,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        localStorage.setItem('spotify_token_expires_at', String(Date.now() + data.expires_in * 1000));

        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}