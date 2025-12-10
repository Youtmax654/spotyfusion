import { getAccessToken, refreshAccessToken } from "@/lib/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
  play: (trackUri: string) => Promise<boolean>;
  pause: () => Promise<void>;
  activatePlayer: () => Promise<void>;
  reconnect: () => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(
  null
);

// Define the SDK ready callback (Spotify SDK expects this to be defined)
if (typeof window !== "undefined") {
  window.onSpotifyWebPlaybackSDKReady = () => {
    window.spotifySDKReady = true;
  };
}

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
        reject(new Error("Spotify SDK load timeout"));
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
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const devices = data.devices || [];

        if (devices.some((d: { id: string }) => d.id === deviceId)) {
          return true;
        }
      }
    } catch {
      // Silently retry
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

export function SpotifyPlayerProvider({
  children,
}: SpotifyPlayerProviderProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const isConnectingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Helper to get a fresh token
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
      return false;
    }

    isConnectingRef.current = true;

    try {
      // Disconnect existing player if any
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        deviceIdRef.current = null;
        setDeviceId(null);
        setIsReady(false);
      }

      const token = await getFreshToken();

      if (!token) {
        setError("Pas de token d'accès. Veuillez vous reconnecter.");
        return false;
      }

      await waitForSpotifySDK();

      const player = new window.Spotify.Player({
        name: "SpotyFusion Blind Test",
        getOAuthToken: async (cb: (token: string) => void) => {
          const freshToken = await getFreshToken();
          if (freshToken) {
            cb(freshToken);
          }
        },
        volume: 0.8,
      });

      // Set up event listeners
      player.addListener("initialization_error", (data: unknown) => {
        const { message } = data as { message: string };
        setError(`Erreur init: ${message}`);
      });

      player.addListener("authentication_error", (data: unknown) => {
        const { message } = data as { message: string };
        setError(
          `Erreur auth: ${message}. Veuillez vous déconnecter et reconnecter.`
        );
      });

      player.addListener("account_error", () => {
        setError(`Compte Premium requis pour le streaming`);
      });

      player.addListener("playback_error", () => {
        // Silently handle playback errors
      });

      // Create a promise that resolves when player is ready
      const readyPromise = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Player ready timeout after 15s"));
        }, 15000);

        player.addListener("ready", (data: unknown) => {
          clearTimeout(timeout);
          const { device_id } = data as { device_id: string };
          resolve(device_id);
        });

        player.addListener("not_ready", () => {
          setIsReady(false);
        });
      });

      player.addListener("player_state_changed", (state: unknown) => {
        if (state) {
          const playerState = state as { paused: boolean };
          setIsPlaying(!playerState.paused);
        }
      });

      const connected = await player.connect();

      if (!connected) {
        setError("Échec de connexion au player");
        return false;
      }

      playerRef.current = player;

      // Wait for the ready event
      const newDeviceId = await readyPromise;

      // Now wait for the device to be visible in the API
      const currentToken = await getFreshToken();

      if (currentToken) {
        await waitForDeviceInAPI(newDeviceId, currentToken, 20, 500);
      }

      deviceIdRef.current = newDeviceId;
      setDeviceId(newDeviceId);
      setIsReady(true);
      setError(null);

      return true;
    } catch (err) {
      setError(`Erreur création player: ${err}`);
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
        // Wait up to 5 seconds for token to become available
        for (let i = 0; i < 50; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          token = getAccessToken();
          if (token) {
            break;
          }
        }
      }

      if (token) {
        isInitializedRef.current = true;
        createPlayer();
      } else {
        setError(null); // Don't show error, just wait
      }
    };

    initializeWhenReady();

    // Cleanup only when the entire app unmounts
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [createPlayer]);

  const activatePlayer = useCallback(async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.activateElement();
      } catch {
        // Silently handle activation errors
      }
    }
  }, []);

  const reconnect = useCallback(async () => {
    await createPlayer();
  }, [createPlayer]);

  const play = useCallback(
    async (trackUri: string): Promise<boolean> => {
      const currentDeviceId = deviceIdRef.current;

      if (!currentDeviceId) {
        setError("Player non prêt - pas de device ID");
        return false;
      }

      const token = await getFreshToken();
      if (!token) {
        setError("Token expiré");
        return false;
      }

      try {
        // Step 1: Transfer playback to this device
        const transferResponse = await fetch(
          "https://api.spotify.com/v1/me/player",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              device_ids: [currentDeviceId],
              play: false,
            }),
          }
        );

        if (
          transferResponse.status === 204 ||
          transferResponse.status === 200
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else if (transferResponse.status === 404) {
          const reconnected = await createPlayer();
          if (!reconnected || !deviceIdRef.current) {
            setError("Reconnexion échouée");
            return false;
          }

          // Try transfer again with new device
          const retryTransfer = await fetch(
            "https://api.spotify.com/v1/me/player",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                device_ids: [deviceIdRef.current],
                play: false,
              }),
            }
          );

          if (retryTransfer.status !== 204 && retryTransfer.status !== 200) {
            setError("Impossible de transférer la lecture");
            return false;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Step 2: Play the track
        const playResponse = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [trackUri],
              position_ms: 10000,
            }),
          }
        );

        if (playResponse.status === 204 || playResponse.status === 200) {
          return true;
        }

        // Handle 404 - try one more time with fresh transfer
        if (playResponse.status === 404) {
          await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              device_ids: [deviceIdRef.current],
              play: false,
            }),
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const retryPlay = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                uris: [trackUri],
                position_ms: 30000,
              }),
            }
          );

          if (retryPlay.status === 204 || retryPlay.status === 200) {
            return true;
          }
        }

        if (playResponse.status === 403) {
          setError("Erreur 403: Premium requis / Session expirée");
          return false;
        }

        setError(`Erreur lecture: ${playResponse.status}`);
        return false;
      } catch {
        setError("Erreur réseau");
        return false;
      }
    },
    [getFreshToken, createPlayer]
  );

  const pausePlayback = useCallback(async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
      } catch {
        // Silently handle pause errors
      }
    }
  }, []);

  const value: SpotifyPlayerContextValue = {
    deviceId,
    isReady,
    isPlaying,
    error,
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
    throw new Error(
      "useSpotifyPlayer must be used within a SpotifyPlayerProvider"
    );
  }
  return context;
}
