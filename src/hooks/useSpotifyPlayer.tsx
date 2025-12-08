import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { getAccessToken, refreshAccessToken } from '../services/spotifyAuth';

// Spotify Player types
interface SpotifyPlayerInstance {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (event: string, callback: (data: unknown) => void) => void;
    removeListener: (event: string) => void;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    togglePlay: () => Promise<void>;
    seek: (position_ms: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    activateElement: () => Promise<void>;
    getCurrentState: () => Promise<unknown>;
}

interface SpotifyPlayerConstructor {
    new(options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
    }): SpotifyPlayerInstance;
}

declare global {
    interface Window {
        Spotify: {
            Player: SpotifyPlayerConstructor;
        };
        onSpotifyWebPlaybackSDKReady: () => void;
        spotifySDKReady?: boolean;
    }
}

interface SpotifyPlayerContextValue {
    deviceId: string | null;
    isReady: boolean;
    isPlaying: boolean;
    error: string | null;
    debugInfo: string;
    play: (trackUri: string) => Promise<boolean>;
    pause: () => Promise<void>;
    activatePlayer: () => Promise<void>;
    reconnect: () => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(null);

// Helper to wait for SDK to load
function waitForSpotifySDK(timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Spotify?.Player) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.Spotify?.Player) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Spotify SDK load timeout'));
            }
        }, 100);
    });
}

// Helper to wait for device to be visible in Spotify API
async function waitForDeviceInAPI(
    deviceId: string,
    token: string,
    maxAttempts = 20,
    delayMs = 500
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const devices = data.devices || [];
                console.log(`🔍 Attempt ${attempt}/${maxAttempts}: Found ${devices.length} devices`);

                if (devices.some((d: { id: string }) => d.id === deviceId)) {
                    console.log('🟢 Device found in API!');
                    return true;
                }
            }
        } catch (err) {
            console.warn(`🟠 Device check attempt ${attempt} failed:`, err);
        }

        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return false;
}

interface SpotifyPlayerProviderProps {
    children: ReactNode;
}

export function SpotifyPlayerProvider({ children }: SpotifyPlayerProviderProps) {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('Initialisation...');

    const playerRef = useRef<SpotifyPlayerInstance | null>(null);
    const deviceIdRef = useRef<string | null>(null);
    const isConnectingRef = useRef(false);
    const isInitializedRef = useRef(false);

    // Function to get a fresh token
    const getFreshToken = useCallback(async (): Promise<string | null> => {
        let token = getAccessToken();
        if (!token) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                token = getAccessToken();
            }
        }
        return token;
    }, []);

    // Create and connect player
    const createPlayer = useCallback(async (): Promise<boolean> => {
        if (isConnectingRef.current) {
            console.log('🟠 Already connecting, skipping...');
            return false;
        }

        isConnectingRef.current = true;

        try {
            // Disconnect existing player if any
            if (playerRef.current) {
                console.log('🟠 Disconnecting existing player...');
                playerRef.current.disconnect();
                playerRef.current = null;
                deviceIdRef.current = null;
                setDeviceId(null);
                setIsReady(false);
            }

            setDebugInfo('Vérification du token...');
            const token = await getFreshToken();

            if (!token) {
                setError('Pas de token d\'accès. Veuillez vous reconnecter.');
                setDebugInfo('Erreur: Pas de token');
                return false;
            }

            setDebugInfo('Attente du SDK Spotify...');
            await waitForSpotifySDK();

            setDebugInfo('Création du player...');
            console.log('🟢 Creating new Spotify Player...');

            const player = new window.Spotify.Player({
                name: 'SpotyFusion Blind Test',
                getOAuthToken: async (cb: (token: string) => void) => {
                    const freshToken = await getFreshToken();
                    if (freshToken) {
                        cb(freshToken);
                    }
                },
                volume: 0.8,
            });

            // Set up event listeners
            player.addListener('initialization_error', (data: unknown) => {
                const { message } = data as { message: string };
                console.error('🔴 Init error:', message);
                setError(`Erreur init: ${message}`);
                setDebugInfo(`Init error: ${message}`);
            });

            player.addListener('authentication_error', (data: unknown) => {
                const { message } = data as { message: string };
                console.error('🔴 Auth error:', message);
                setError(`Erreur auth: ${message}. Veuillez vous déconnecter et reconnecter.`);
                setDebugInfo(`Auth error: ${message}`);
            });

            player.addListener('account_error', (data: unknown) => {
                const { message } = data as { message: string };
                console.error('🔴 Account error:', message);
                setError(`Compte Premium requis pour le streaming`);
                setDebugInfo(`Account error: ${message}`);
            });

            player.addListener('playback_error', (data: unknown) => {
                const { message } = data as { message: string };
                console.error('🟡 Playback error:', message);
                setDebugInfo(`Playback error: ${message}`);
            });

            // Create a promise that resolves when player is ready
            const readyPromise = new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Player ready timeout after 15s'));
                }, 15000);

                player.addListener('ready', (data: unknown) => {
                    clearTimeout(timeout);
                    const { device_id } = data as { device_id: string };
                    console.log('🟢 Spotify Player ready with Device ID:', device_id);
                    resolve(device_id);
                });

                player.addListener('not_ready', (data: unknown) => {
                    const { device_id } = data as { device_id: string };
                    console.log('🟠 Device went offline:', device_id);
                    setIsReady(false);
                    setDebugInfo('Device hors ligne - reconnexion nécessaire');
                });
            });

            player.addListener('player_state_changed', (state: unknown) => {
                if (state) {
                    const playerState = state as { paused: boolean; track_window?: { current_track?: { name: string } } };
                    setIsPlaying(!playerState.paused);
                    const trackName = playerState.track_window?.current_track?.name || 'Unknown';
                    console.log('🎵 State changed:', playerState.paused ? 'Paused' : 'Playing', trackName);
                }
            });

            setDebugInfo('Connexion au player...');
            const connected = await player.connect();

            if (!connected) {
                console.error('🔴 Failed to connect player');
                setError('Échec de connexion au player');
                setDebugInfo('Échec connexion');
                return false;
            }

            console.log('🟢 Player connected, waiting for ready event...');
            setDebugInfo('Connecté! En attente du device...');

            playerRef.current = player;

            // Wait for the ready event
            const newDeviceId = await readyPromise;

            // Now wait for the device to be visible in the API
            setDebugInfo('Vérification visibilité du device...');
            const currentToken = await getFreshToken();

            if (currentToken) {
                const visible = await waitForDeviceInAPI(newDeviceId, currentToken, 20, 500);

                if (!visible) {
                    console.warn('� Device never became visible in API, but continuing anyway...');
                    setDebugInfo('Device créé (API lente)');
                }
            }

            deviceIdRef.current = newDeviceId;
            setDeviceId(newDeviceId);
            setIsReady(true);
            setError(null);
            setDebugInfo(`Player prêt! Device: ${newDeviceId.substring(0, 8)}...`);

            return true;

        } catch (err) {
            console.error('🔴 Player creation error:', err);
            setError(`Erreur création player: ${err}`);
            setDebugInfo(`Erreur: ${err}`);
            return false;
        } finally {
            isConnectingRef.current = false;
        }
    }, [getFreshToken]);

    // Initialize player once on mount (provider level = app level)
    useEffect(() => {
        if (isInitializedRef.current) {
            return;
        }

        // Wait for token to be available before initializing
        const initializeWhenReady = async () => {
            // Try immediately first
            let token = getAccessToken();

            if (!token) {
                console.log('🟡 Token not available yet, waiting...');
                setDebugInfo('En attente du token...');

                // Wait up to 5 seconds for token to become available
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    token = getAccessToken();
                    if (token) {
                        console.log('🟢 Token now available after waiting');
                        break;
                    }
                }
            }

            if (token) {
                isInitializedRef.current = true;
                createPlayer();
            } else {
                console.log('🟠 No token after waiting, will retry when user navigates');
                setDebugInfo('En attente de connexion...');
                setError(null); // Don't show error, just wait
            }
        };

        initializeWhenReady();

        // Cleanup only when the entire app unmounts
        return () => {
            if (playerRef.current) {
                console.log('🔴 Provider unmounting, disconnecting player...');
                playerRef.current.disconnect();
            }
        };
    }, [createPlayer]);

    const activatePlayer = useCallback(async () => {
        if (playerRef.current) {
            try {
                await playerRef.current.activateElement();
                console.log('🟢 Player element activated');
            } catch (err) {
                console.error('🔴 Activate error:', err);
            }
        }
    }, []);

    const reconnect = useCallback(async () => {
        console.log('🔄 Manual reconnect requested');
        setDebugInfo('Reconnexion en cours...');
        await createPlayer();
    }, [createPlayer]);

    const play = useCallback(async (trackUri: string): Promise<boolean> => {
        const currentDeviceId = deviceIdRef.current;

        console.log('🎵 Attempting to play:', trackUri);
        console.log('📱 Device ID:', currentDeviceId);

        if (!currentDeviceId) {
            setError('Player non prêt - pas de device ID');
            setDebugInfo('Erreur: Pas de device ID');
            return false;
        }

        const token = await getFreshToken();
        if (!token) {
            setError('Token expiré');
            return false;
        }

        try {
            setDebugInfo('Transfert vers le device...');

            // Step 1: Transfer playback to this device
            console.log('📱 Transferring playback to device...');
            const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_ids: [currentDeviceId],
                    play: false,
                }),
            });

            console.log('📱 Transfer response:', transferResponse.status);

            if (transferResponse.status === 204 || transferResponse.status === 200) {
                await new Promise(resolve => setTimeout(resolve, 500));
            } else if (transferResponse.status === 404) {
                console.log('🟠 Device not found during transfer, trying reconnect...');
                setDebugInfo('Device perdu, reconnexion...');

                const reconnected = await createPlayer();
                if (!reconnected || !deviceIdRef.current) {
                    setError('Reconnexion échouée');
                    return false;
                }

                // Try transfer again with new device
                const retryTransfer = await fetch('https://api.spotify.com/v1/me/player', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        device_ids: [deviceIdRef.current],
                        play: false,
                    }),
                });

                if (retryTransfer.status !== 204 && retryTransfer.status !== 200) {
                    console.error('🔴 Retry transfer failed:', retryTransfer.status);
                    setError('Impossible de transférer la lecture');
                    return false;
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setDebugInfo('Lancement lecture...');

            // Step 2: Play the track
            const playResponse = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uris: [trackUri],
                        position_ms: 0,
                    }),
                }
            );

            console.log('🎵 Play response status:', playResponse.status);

            if (playResponse.status === 204 || playResponse.status === 200) {
                console.log('🟢 Play command successful!');
                setDebugInfo('Lecture démarrée!');
                return true;
            }

            // Handle 404 - try one more time with fresh transfer
            if (playResponse.status === 404) {
                console.log('🟠 Play 404, attempting fresh transfer and retry...');
                setDebugInfo('Erreur 404, nouvelle tentative...');

                await fetch('https://api.spotify.com/v1/me/player', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        device_ids: [deviceIdRef.current],
                        play: false,
                    }),
                });

                await new Promise(resolve => setTimeout(resolve, 1000));

                const retryPlay = await fetch(
                    `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            uris: [trackUri],
                            position_ms: 0,
                        }),
                    }
                );

                if (retryPlay.status === 204 || retryPlay.status === 200) {
                    console.log('🟢 Retry play successful!');
                    setDebugInfo('Lecture démarrée (retry)!');
                    return true;
                }

                const retryError = await retryPlay.text();
                console.error('🔴 Retry play failed:', retryPlay.status, retryError);
            }

            if (playResponse.status === 403) {
                setError("Erreur 403: Premium requis / Session expirée");
                setDebugInfo("Erreur 403: Premium/Token");
                return false;
            }

            const errorText = await playResponse.text();
            console.error('🔴 Play Failed:', errorText);
            setError(`Erreur lecture: ${playResponse.status}`);
            setDebugInfo(`Echec lecture (${playResponse.status})`);
            return false;

        } catch (err) {
            console.error('🔴 Play exception:', err);
            setError('Erreur réseau');
            setDebugInfo(`Exception: ${err}`);
            return false;
        }
    }, [getFreshToken, createPlayer]);

    const pausePlayback = useCallback(async () => {
        if (playerRef.current) {
            try {
                await playerRef.current.pause();
                setDebugInfo('Pausé');
            } catch (err) {
                console.error('🔴 Pause error:', err);
            }
        }
    }, []);

    const value: SpotifyPlayerContextValue = {
        deviceId,
        isReady,
        isPlaying,
        error,
        debugInfo,
        play,
        pause: pausePlayback,
        activatePlayer,
        reconnect,
    };

    return (
        <SpotifyPlayerContext.Provider value={value}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}

// Hook to use the Spotify player context
export function useSpotifyPlayer(): SpotifyPlayerContextValue {
    const context = useContext(SpotifyPlayerContext);
    if (!context) {
        throw new Error('useSpotifyPlayer must be used within a SpotifyPlayerProvider');
    }
    return context;
}
