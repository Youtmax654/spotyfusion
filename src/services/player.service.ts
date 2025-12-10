import type { RecentlyPlayedItem, SpotifyDevice } from "@/schemas/Spotify";
import { fetchWithAccessToken, putPlayerRequest } from "./base.service";

// Recently Played
export async function getRecentlyPlayed(
  limit: number = 5
): Promise<RecentlyPlayedItem[]> {
  const response = await fetchWithAccessToken(
    `/me/player/recently-played?limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch recently played");
  const data = await response.json();
  return data.items;
}

// Playback Controls
export async function playTrack(
  trackUri: string,
  deviceId?: string
): Promise<boolean> {
  const endpoint = deviceId
    ? `/me/player/play?device_id=${deviceId}`
    : "/me/player/play";

  return putPlayerRequest(endpoint, { uris: [trackUri], position_ms: 0 });
}

export async function pausePlayback(): Promise<boolean> {
  return putPlayerRequest("/me/player/pause");
}

export async function transferPlayback(deviceId: string): Promise<boolean> {
  return putPlayerRequest("/me/player", {
    device_ids: [deviceId],
    play: false,
  });
}

// Available Devices
export async function getAvailableDevices(): Promise<SpotifyDevice[]> {
  const response = await fetchWithAccessToken("/me/player/devices");
  if (!response.ok) throw new Error("Failed to fetch devices");
  const data = await response.json();
  return data.devices;
}

