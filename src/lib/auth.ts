export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch("/api/spotify/refresh_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  localStorage.setItem("access_token", newAccessToken);
  return newAccessToken;
};