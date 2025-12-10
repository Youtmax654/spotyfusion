import { spotifyConfig } from "@/config/spotify";
import MusicNoteIcon from "@/icons/MusicNoteIcon";
import {
  Box,
  Button,
  Card,
  Center,
  Icon,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Green linear gradient overlay */}
      <Box
        position="absolute"
        w="100%"
        h="100%"
        opacity={0.4}
        style={{
          background: "linear-gradient(180deg, #1ECC5C 0%, #121212 66.35%)",
          boxShadow: "4px 0px 20px 0px rgba(0, 0, 0, 0.5)",
        }}
      />
      {/* Album covers image */}
      <Image
        src="/album-covers-collage.png"
        alt="Album covers collage"
        position="absolute"
        right="0px"
        top="0px"
        opacity={0.9}
        display={{ base: "none", lg: "block" }}
      />

      {/* Login card */}
      <Card.Root
        background="rgba(24, 24, 24, 0.95)"
        paddingY="64px"
        paddingX="80px"
        borderRadius="16px"
        style={{
          boxShadow: "4px 0px 20px 0px rgba(0, 0, 0, 0.5)",
        }}
        justifyContent="center"
        alignItems="center"
      >
        <Card.Header alignItems="center" gap="24px">
          <Center
            height={20}
            width={20}
            rounded={100}
            style={{
              background: "linear-gradient(135deg, #1DB954 0%, #1ED760 100%)",
              boxShadow: "0px 0px 40px 0px rgba(29, 185, 84, 0.4)",
            }}
          >
            <Icon as={MusicNoteIcon} color="white" boxSize={10} />
          </Center>
          <Text fontSize="5xl" fontWeight="bold" textAlign="center">
            SpotyFusion
          </Text>
        </Card.Header>
        <Card.Body>
          <Stack gap={12} flexDirection="column">
            <Text
              w="380px"
              textAlign="center"
              fontSize="md"
              fontWeight="normal"
              color="rgba(255,255,255,0.8)"
            >
              Enrichissez votre expérience Spotify avec des statistiques
              détaillées, des blind tests et un générateur de playlists
              intelligent
            </Text>
            <Center gap="24px" flexDirection="column">
              <Button
                size="lg"
                style={{
                  background:
                    "linear-gradient(135deg, #1DB954 0%, #1ED760 100%)",
                  boxShadow: "0px 0px 30px 0px rgba(29, 185, 84, 0.3)",
                  color: "white",
                }}
                onClick={connect}
                width="320px"
                height="60px"
                borderRadius="500px"
              >
                <Text fontWeight="bold" fontSize="xl">
                  Se Connecter avec Spotify
                </Text>
              </Button>
              <Text fontWeight="normal" color="rgba(255,255,255,0.5)">
                Vous serez redirigé vers Spotify pour autoriser l'accès
              </Text>
            </Center>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}

// PKCE code challenge generation
const connect = async () => {
  const generateRandomString = (length: number) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const codeVerifier = generateRandomString(64);

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  };

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // generated in the previous step
  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: spotifyConfig.clientId,
    scope: spotifyConfig.scopes,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: spotifyConfig.redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};
