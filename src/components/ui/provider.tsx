"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { Toaster } from "./toaster";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          value: "#1DB954",
        },
        spotify: {
          green: { value: "#1DB954" },
          greenDark: { value: "#22683b" },
          black: { value: "#191414" },
          dark: { value: "#121212" },
          panel: { value: "#181818" },
          darker: { value: "#242424" },
          gray: { value: "#282828" },
          lightGray: { value: "#b3b3b3" },
          white: { value: "#ffffff" },
          border: { value: "#ffffff1a" },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <Toaster />
      <ColorModeProvider {...props} defaultTheme="dark" />
    </ChakraProvider>
  );
}
