import type { SpotifyArtist } from "@/schemas/Spotify";
import { Box, Image, Text, VStack } from "@chakra-ui/react";

interface Props {
  artist?: SpotifyArtist;
  index?: number;
}
export default function ArtistAvatar({ artist, index }: Props) {
  if (!artist || index === undefined) {
    return (
      <VStack minW="120px" gap={3}>
        <Box w="120px" h="120px" bg="spotify.gray" borderRadius="full" />
        <Box w="100%" h="20px" bg="spotify.gray" borderRadius="md" />
      </VStack>
    );
  }

  return (
    <VStack minW="120px" gap={3} overflow="visible">
      <Box
        w="120px"
        h="120px"
        cursor="pointer"
        transition="all 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.08)",
        }}
      >
        <Image
          src={artist.images[0]?.url || "/default-artist.png"}
          alt={artist.name}
          w="100%"
          h="100%"
          borderRadius="full"
          objectFit="cover"
        />
      </Box>
      <Text
        fontSize="sm"
        color="spotify.white"
        textAlign="center"
        maxW="120px"
        truncate
      >
        <Text as="span" color="spotify.white" fontWeight="bold">
          #{index + 1}.
        </Text>{" "}
        {artist.name}
      </Text>
    </VStack>
  );
}
