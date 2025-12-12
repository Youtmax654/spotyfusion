import ClockIcon from "@/icons/ClockIcon";
import { formatTimeAgo } from "@/lib/utils";
import type { RecentlyPlayedItem } from "@/schemas/Spotify";
import { Box, Flex, HStack, Icon, Image, Text, VStack } from "@chakra-ui/react";

interface Props {
  recentlyPlayed: Array<RecentlyPlayedItem>;
}
export default function LastListened({ recentlyPlayed }: Props) {
  return (
    <Flex
      gap={4}
      flexDir={{ base: "column", lg: "row" }}
      overflow="visible"
      maxW="100%"
    >
      {recentlyPlayed[0] && (
        <Box flexShrink={0} w="240px">
          <Image
            src={
              recentlyPlayed[0].track.album.images[0]?.url ||
              "/default-album.png"
            }
            alt={recentlyPlayed[0].track.album.name}
            w="240px"
            h="240px"
            borderRadius="md"
            objectFit="cover"
            mb={3}
            boxShadow="lg"
          />
          <VStack align="start" gap={2}>
            <Text
              fontSize="2xl"
              fontWeight="semibold"
              color="spotify.white"
              lineHeight="short"
              wordBreak="break-word"
            >
              {recentlyPlayed[0].track.name}
            </Text>
            <Text fontSize="xl" color="spotify.lightGray">
              {recentlyPlayed[0].track.artists[0]?.name}
            </Text>
            <HStack gap={2} color="spotify.lightGray" fontSize="sm">
              <Icon as={ClockIcon} boxSize={4} />
              <Text>{formatTimeAgo(recentlyPlayed[0].played_at)}</Text>
            </HStack>
          </VStack>
        </Box>
      )}

      <VStack flex={1} gap={3} align="stretch" overflow="visible">
        {recentlyPlayed.slice(1).map((item, index) => (
          <Flex
            key={`${item.track.id}-${index}`}
            align="center"
            gap={3}
            p={4}
            bg="spotify.darker"
            border="1px solid"
            borderColor="spotify.border"
            width="100%"
            borderRadius="md"
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            _hover={{
              transform: "scale(1.02)",
              bg: "rgba(255, 255, 255, 0.08)",
              borderColor: "spotify.green",
            }}
          >
            <Image
              src={item.track.album.images[0]?.url || "/default-album.png"}
              alt={item.track.album.name}
              w="50px"
              h="50px"
              borderRadius="sm"
              objectFit="cover"
              flexShrink={0}
            />
            <VStack flex={1} align="start" gap={0} minW={0}>
              <Text
                fontSize="md"
                fontWeight="semibold"
                color="spotify.white"
                truncate
                w="full"
              >
                {item.track.name}
              </Text>
              <Text fontSize="sm" color="spotify.lightGray" truncate w="full">
                {item.track.artists[0]?.name}
              </Text>
            </VStack>
            <HStack
              gap={2}
              color="spotify.lightGray"
              fontSize="sm"
              flexShrink={0}
            >
              <Icon as={ClockIcon} boxSize={4} />
              <Text whiteSpace="nowrap">{formatTimeAgo(item.played_at)}</Text>
            </HStack>
          </Flex>
        ))}
      </VStack>
    </Flex>
  );
}
