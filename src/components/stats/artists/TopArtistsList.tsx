import type { SpotifyArtist } from "@/schemas/Spotify";
import { Box, Flex, Text } from "@chakra-ui/react";
import ScrollButton from "../ScrollButton";
import ArtistAvatar from "./ArtistAvatar";

interface Props {
  topArtists: Array<SpotifyArtist>;
}
export default function TopArtistsList({ topArtists }: Props) {
  if (topArtists.length === 0) {
    return (
      <Box position="relative">
        <Flex
          gap={5}
          css={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
          }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <ArtistAvatar key={index} />
          ))}
        </Flex>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          background="spotify.darker"
          p={4}
          borderRadius="md"
          textAlign="center"
          border="1px solid"
          borderColor="spotify.border"
        >
          <Text fontSize="md" color="spotify.lightGray">
            Aucune donnée disponible pour cette période.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box position="relative">
      <Flex
        gap={5}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
        }}
      >
        {topArtists.map((artist, index) => (
          <ArtistAvatar artist={artist} index={index} key={artist.id} />
        ))}
      </Flex>

      <ScrollButton
        direction="left"
        onClick={() => {}}
        // visible={artistsCanScroll.left}
        visible={true}
      />
      <ScrollButton
        direction="right"
        onClick={() => {}}
        // visible={artistsCanScroll.right}
        visible={true}
      />
    </Box>
  );
}
