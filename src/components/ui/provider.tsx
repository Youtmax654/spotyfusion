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
