import { SPOTIFY_API_BASE } from "@/config/spotify";

// Helper for GET requests with access token
export async function fetchWithAccessToken(endpoint: string): Promise<Response> {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}

// Helper for PUT requests to Spotify player API
export async function putPlayerRequest(
  endpoint: string,
  body?: object
): Promise<boolean> {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return false;

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body && { "Content-Type": "application/json" }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  return response.ok || response.status === 204;
}