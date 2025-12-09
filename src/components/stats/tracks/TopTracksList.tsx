import type { SpotifyTrack } from "@/schemas/Spotify";
import { Box, Flex } from "@chakra-ui/react";
import TrackAvatar from "./TrackAvatar";

interface Props {
  topTracks: Array<SpotifyTrack>;
}
export default function TopTracksList({ topTracks }: Props) {
  if (topTracks.length === 0) {
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
            <TrackAvatar key={index} />
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
          <Box fontSize="md" color="spotify.lightGray">
            Aucune donnée disponible pour cette période.
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box position="relative">
      <Flex gap={5} overflowX="auto">
        {topTracks.map((track, index) => (
          <TrackAvatar track={track} index={index} key={track.id} />
        ))}
      </Flex>

      {/* <ScrollButton
        direction="left"
        onClick={() => scrollLeft(tracksGridRef)}
        visible={tracksCanScroll.left}
      />
      <ScrollButton
        direction="right"
        onClick={() => scrollRight(tracksGridRef)}
        visible={tracksCanScroll.right}
      /> */}
    </Box>
  );
}
