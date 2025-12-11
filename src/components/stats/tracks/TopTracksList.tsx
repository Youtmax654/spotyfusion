import type { SpotifyTrack } from "@/schemas/Spotify";
import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ScrollButton from "../ScrollButton";
import TrackAvatar from "./TrackAvatar";

interface Props {
  topTracks: Array<SpotifyTrack>;
}
export default function TopTracksList({ topTracks }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const canScrollLeft = el.scrollLeft > 0;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

    setCanScroll({ left: canScrollLeft, right: canScrollRight });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, topTracks]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
    <Box position="relative" width="100%" overflow="visible">
      <Flex
        ref={scrollRef}
        gap={5}
        overflowX="auto"
        py={3}
        px={2}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          overflowY: "visible",
        }}
      >
        {topTracks.map((track, index) => (
          <TrackAvatar track={track} index={index} key={track.id} />
        ))}
      </Flex>

      <ScrollButton
        direction="left"
        onClick={() => scroll("left")}
        visible={canScroll.left}
      />
      <ScrollButton
        direction="right"
        onClick={() => scroll("right")}
        visible={canScroll.right}
      />
    </Box>
  );
}
