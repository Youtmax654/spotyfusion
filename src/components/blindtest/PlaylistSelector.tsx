import type { SpotifyPlaylist } from "@/schemas/Spotify";
import { Box, Button, Center, Grid, Image, Text } from "@chakra-ui/react";
import { FaCheck, FaLock, FaPlay } from "react-icons/fa";

interface PlaylistSelectorProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylist: SpotifyPlaylist | null;
  onSelectPlaylist: (playlist: SpotifyPlaylist) => void;
  onStartGame: () => void;
  loading: boolean;
  isPlayerReady: boolean;
  playerError: boolean;
}

export default function PlaylistSelector({
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
  onStartGame,
  loading,
  isPlayerReady,
  playerError,
}: PlaylistSelectorProps) {
  return (
    <Box>
      <Text fontSize="4xl" fontWeight="bold" color="spotify.white">
        Blind Test
      </Text>
      <Text fontSize="md" fontWeight="normal" color="spotify.lightGray">
        Testez vos connaissances musicales en devinant les morceaux
      </Text>

      {/* Conteneur avec position relative pour l'overlay */}
      <Box position="relative" minH="70vh" mt={6}>
        <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
          Mes playlists
        </Text>

        {loading ? (
          <Center py={10}>
            <Text color="#b3b3b3">Chargement...</Text>
          </Center>
        ) : (
          <>
            <Grid
              templateColumns="repeat(auto-fill, minmax(100px, 1fr))"
              gap={4}
              mb={8}
            >
              {playlists.map((playlist) => (
                <Box
                  key={playlist.id}
                  cursor="pointer"
                  onClick={() => onSelectPlaylist(playlist)}
                  position="relative"
                  transition="transform 0.2s"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Image
                    src={playlist.images[0]?.url || "/placeholder.png"}
                    alt={playlist.name}
                    borderRadius="md"
                    w="100%"
                    aspectRatio={1}
                    objectFit="cover"
                  />
                  {selectedPlaylist?.id === playlist.id && (
                    <Center
                      position="absolute"
                      bottom={2}
                      right={2}
                      w={6}
                      h={6}
                      bg="#1db954"
                      borderRadius="full"
                    >
                      <FaCheck size={12} color="black" />
                    </Center>
                  )}
                  <Text
                    color="white"
                    fontSize="sm"
                    mt={2}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {playlist.name}
                  </Text>
                </Box>
              ))}
            </Grid>

            <Button
              onClick={onStartGame}
              disabled={!selectedPlaylist || loading || !isPlayerReady}
              bg="white"
              color="black"
              borderRadius="full"
              px={6}
              py={5}
              fontWeight="semibold"
              fontSize="sm"
              _hover={{ bg: "gray.100" }}
              _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                bg: "gray.400",
              }}
            >
              <FaPlay style={{ marginRight: 10 }} size={12} />
              {loading
                ? "Chargement..."
                : isPlayerReady
                  ? "Commencer le Blind Test"
                  : "Lecteur non prêt"}
            </Button>
          </>
        )}

        {/* Overlay flou uniquement sur cette section */}
        {playerError && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="#121111ff"
            backdropFilter="blur(16px)"
            zIndex={100}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
          >
            <Box
              bg="#181818"
              borderRadius="xl"
              p={8}
              maxW="400px"
              mx={4}
              textAlign="center"
              boxShadow="2xl"
            >
              <Center
                w={16}
                h={16}
                bg="whiteAlpha.100"
                borderRadius="full"
                mx="auto"
                mb={5}
              >
                <FaLock size={28} color="#b3b3b3" />
              </Center>
              <Text fontSize="xl" fontWeight="bold" color="white" mb={3}>
                Compte Premium requis
              </Text>
              <Text color="#b3b3b3" fontSize="sm">
                Le Blind Test nécessite un abonnement Spotify Premium pour lire
                les morceaux.
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
