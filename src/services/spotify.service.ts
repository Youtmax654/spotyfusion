import type { User } from "@/schemas/User";

export const spotifyService = {
    getUserProfile: async (): Promise<User | null> => {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        return data as User;
    },
}