import { SPOTIFY_GENRES } from "@/constants/genres";
import type { Seed } from "@/schemas/Spotify";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";

interface Props {
  selectedSeeds: Seed[];
  onSelectSeed: (seed: Seed) => void;
}
export default function GenresList({
  selectedSeeds = [],
  onSelectSeed,
}: Props) {
  const handleSelectGenre = (genre: { label: string; value: string }) => {
    onSelectSeed({ type: "genre", id: genre.value, name: genre.label });
  };

  return (
    <VStack gap="8px" align="start">
      <Text fontWeight="normal" fontSize="sm" color="spotify.lightGray">
        Genres populaires :
      </Text>

      <Box>
        <HStack gap="8px" flexWrap="wrap">
          {SPOTIFY_GENRES.map((genre) => (
            <Button
              key={genre.value}
              fontSize="sm"
              h="32px"
              borderRadius="full"
              paddingX="12px"
              cursor="pointer"
              variant="outline"
              borderColor="spotify.border"
              color="spotify.lightGray"
              bg={
                selectedSeeds.some((s) => s.id === genre.value)
                  ? "spotify.green/50"
                  : "transparent"
              }
              onClick={() => handleSelectGenre(genre)}
            >
              {genre.label}
            </Button>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}
