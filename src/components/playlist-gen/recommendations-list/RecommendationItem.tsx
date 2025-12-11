import type { SpotifyTrack } from "@/schemas/Spotify";
import { Box, Flex, HStack, Image, Text, Badge } from "@chakra-ui/react";
import { LuActivity } from "react-icons/lu";

interface RecommendationItemProps {
  index: number;
  track: SpotifyTrack;
  score: number;
}

export default function RecommendationItem({
  index,
  track,
  score,
}: RecommendationItemProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      p={3}
      borderRadius="md"
      gap={4}
      w="full"
      h="84px"
      border="1px solid"
      borderColor="spotify.border"
    >
      {/* Index */}
      <Text color="spotify.lightGray" w="8" textAlign="center" fontSize="sm">
        {index}
      </Text>

      {/* Track Info */}
      <HStack flex="2" gap={4}>
        <Image
          src={track?.album.images[0].url}
          alt={track?.name}
          boxSize="40px"
          borderRadius="sm"
          objectFit="cover"
        />
        <Box>
          <Text fontWeight="medium" fontSize="md" lineHeight="short" color="white">
            {track?.name}
          </Text>
          <Text color="spotify.lightGray" fontSize="sm">
            {track?.artists[0].name}
          </Text>
        </Box>
      </HStack>

      {/* Album / Middle Column */}
      <Flex flex="2" align="center" display={{ base: "none", md: "flex" }}>
        <Text color="spotify.lightGray" fontSize="sm">
          {track?.album.name}
        </Text>
      </Flex>

      {/* Duration */}
      <Flex w="16" flex={1} align="center">
        <Text color="spotify.lightGray" fontSize="sm">
          {(track?.duration_ms / 60000).toFixed(2).split(".").join(":")}
        </Text>
      </Flex>

      {/* Score */}
      <Flex w="24" justify="flex-end" align="center" gap={3}>
        <Box color="spotify.green">
          <LuActivity size={20} />
        </Box>
        <Badge
          bg="spotify.green"
          color="black"
          variant="solid"
          borderRadius="full"
          px={2}
        >
          {score}
        </Badge>
      </Flex>
    </Flex>
  );
}
