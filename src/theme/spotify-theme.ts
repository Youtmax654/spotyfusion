import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const spotifyConfig = defineConfig({
    theme: {
        tokens: {
            colors: {
                spotify: {
                    green: { value: "#1DB954" },
                    greenDark: { value: "#1ed760" },
                    black: { value: "#191414" },
                    dark: { value: "#121212" },
                    gray: { value: "#282828" },
                    lightGray: { value: "#b3b3b3" },
                    white: { value: "#ffffff" },
                },
            },
            fonts: {
                body: { value: "'Circular Std', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
                heading: { value: "'Circular Std', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    DEFAULT: { value: "{colors.spotify.dark}" },
                    subtle: { value: "{colors.spotify.gray}" },
                    card: { value: "rgba(24, 24, 24, 0.95)" },
                },
                fg: {
                    DEFAULT: { value: "{colors.spotify.white}" },
                    muted: { value: "{colors.spotify.lightGray}" },
                },
                accent: {
                    DEFAULT: { value: "{colors.spotify.green}" },
                    hover: { value: "{colors.spotify.greenDark}" },
                },
            },
        },
    },
    globalCss: {
        body: {
            bg: "spotify.dark",
            color: "spotify.white",
            fontFamily: "body",
        },
    },
});

export const spotifySystem = createSystem(defaultConfig, spotifyConfig);
