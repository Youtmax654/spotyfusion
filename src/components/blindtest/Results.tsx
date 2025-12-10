import type { SpotifyTrack } from "@/schemas/Spotify";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Center,
} from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa";

interface PlayedTrack {
  track: SpotifyTrack;
  wasCorrect: boolean;
}

interface ResultsProps {
  score: number;
  playlistName: string;
  playedTracks: PlayedTrack[];
  onPlayAgain: () => void;
}

export default function Results({
  score,
  playlistName,
  playedTracks,
  onPlayAgain,
}: ResultsProps) {
  return (
    <Box>
      {/* Score header */}
      <Flex
        bg="#1db954"
        borderRadius="lg"
        p={4}
        mb={8}
        justify="space-between"
        align="center"
      >
        <Box bg="white" borderRadius="md" px={4} py={2}>
          <Text fontSize="xl" fontWeight="bold" color="#121212">
            {score}pts
          </Text>
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="#121212">
          {playlistName}
        </Text>
      </Flex>

      <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
        Morceaux joués
      </Text>

      <VStack gap={3} align="stretch" mb={8}>
        {playedTracks.map(({ track, wasCorrect }, index) => (
          <HStack
            key={`${track.id}-${index}`}
            bg={wasCorrect ? "rgba(29, 185, 84, 0.2)" : "whiteAlpha.50"}
            borderRadius="lg"
            p={3}
            gap={4}
          >
            <Image
              src={track.album.images[0]?.url}
              alt={track.name}
              w="50px"
              h="50px"
              borderRadius="md"
              objectFit="cover"
            />
            <Box flex={1}>
              <Text color="white" fontWeight="medium">
                {track.name}
              </Text>
              <Text color="#b3b3b3" fontSize="sm">
                {track.artists.map((a) => a.name).join(", ")}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>

      <Center>
        <Button
          onClick={onPlayAgain}
          bg="white"
          color="black"
          borderRadius="full"
          px={6}
          py={5}
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ bg: "gray.100" }}
        >
          <FaPlay style={{ marginRight: 10 }} size={12} />
          Rejouer
        </Button>
      </Center>
    </Box>
  );
}
