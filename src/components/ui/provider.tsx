"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { spotifySystem } from "../../theme/spotify-theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={spotifySystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
