import type { SpotifyArtist } from "@/schemas/Spotify";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ScrollButton from "../ScrollButton";
import ArtistAvatar from "./ArtistAvatar";

interface Props {
  topArtists: Array<SpotifyArtist>;
}
export default function TopArtistsList({ topArtists }: Props) {
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
  }, [checkScroll, topArtists]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
        {topArtists.map((artist, index) => (
          <ArtistAvatar artist={artist} index={index} key={artist.id} />
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
