import type { SpotifyTrack } from "@/schemas/Spotify";
import { Box, Image, Text, VStack } from "@chakra-ui/react";

interface Props {
  track?: SpotifyTrack;
  index?: number;
}
export default function TrackAvatar({ track, index }: Props) {
  if (!track || index === undefined) {
    return (
      <VStack minW="120px" alignItems="flex-start" gap={2}>
        <Box w="120px" h="120px" bg="spotify.gray" />
        <Box w="100%" h="21px" bg="spotify.gray" borderRadius="md" />
        <Box w="80%" h="24px" bg="spotify.gray" borderRadius="md" />
      </VStack>
    );
  }

  return (
    <VStack minW="120px" gap={2} align="start" overflow="visible">
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
          src={track.album.images[0]?.url || "/default-album.png"}
          alt={track.album.name}
          w="100%"
          h="100%"
          objectFit="cover"
        />
      </Box>
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="spotify.white"
        maxW="120px"
        truncate
      >
        <Text as="span">#{index + 1}.</Text> {track.name}
      </Text>
      <Text fontSize="md" color="spotify.lightGray" maxW="120px" truncate>
        {track.artists[0]?.name}
      </Text>
    </VStack>
  );
}
