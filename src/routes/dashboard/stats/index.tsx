import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Icon,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";
import type {
  RecentlyPlayedItem,
  SpotifyArtist,
  SpotifyTrack,
} from "@/schemas/Spotify";
import { spotifyService } from "@/services/spotify.service";
import { formatTimeAgo } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/stats/")({
  component: StatsPage,
});

type TimeRange = "short_term" | "medium_term" | "long_term";

const timeRangeLabels: Record<TimeRange, string> = {
  short_term: "4 semaines",
  medium_term: "6 mois",
  long_term: "Tout le temps",
};

export default function StatsPage() {
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(
    []
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("short_term");
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const artistsGridRef = useRef<HTMLDivElement>(null);
  const tracksGridRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Visibilité des boutons de défilement
  const [artistsCanScrollLeft, setArtistsCanScrollLeft] = useState(false);
  const [artistsCanScrollRight, setArtistsCanScrollRight] = useState(true);
  const [tracksCanScrollLeft, setTracksCanScrollLeft] = useState(false);
  const [tracksCanScrollRight, setTracksCanScrollRight] = useState(true);

  const updateScrollButtons = (
    ref: React.RefObject<HTMLDivElement | null>,
    setLeft: (v: boolean) => void,
    setRight: (v: boolean) => void
  ) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const artistsEl = artistsGridRef.current;
    const tracksEl = tracksGridRef.current;

    const handleArtistsScroll = () =>
      updateScrollButtons(
        artistsGridRef,
        setArtistsCanScrollLeft,
        setArtistsCanScrollRight
      );
    const handleTracksScroll = () =>
      updateScrollButtons(
        tracksGridRef,
        setTracksCanScrollLeft,
        setTracksCanScrollRight
      );

    artistsEl?.addEventListener("scroll", handleArtistsScroll);
    tracksEl?.addEventListener("scroll", handleTracksScroll);

    handleArtistsScroll();
    handleTracksScroll();

    return () => {
      artistsEl?.removeEventListener("scroll", handleArtistsScroll);
      tracksEl?.removeEventListener("scroll", handleTracksScroll);
    };
  }, [topArtists, topTracks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération depuis le cache si disponible
        const cachedRecentlyPlayed = sessionStorage.getItem(
          "spotyfusion_recently_played"
        );

        const [artists, tracks] = await Promise.all([
          spotifyService.getTopArtists(timeRange, 10),
          spotifyService.getTopTracks(timeRange, 10),
        ]);

        setTopArtists(artists);
        setTopTracks(tracks);

        if (cachedRecentlyPlayed) {
          setRecentlyPlayed(JSON.parse(cachedRecentlyPlayed));
        } else {
          const recent = await spotifyService.getRecentlyPlayed(5);
          setRecentlyPlayed(recent);
          sessionStorage.setItem(
            "spotyfusion_recently_played",
            JSON.stringify(recent)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, timeRange]);

  const handleTimeRangeChange = async (newRange: TimeRange) => {
    setTimeRange(newRange);
    setDataLoading(true);
    try {
      const [artists, tracks] = await Promise.all([
        spotifyService.getTopArtists(newRange, 10),
        spotifyService.getTopTracks(newRange, 10),
      ]);
      setTopArtists(artists);
      setTopTracks(tracks);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <Center flex={1} p={8}>
        <VStack gap={4}>
          <Spinner size="xl" color="spotify.green" />
          <Text color="spotify.lightGray">
            Chargement de vos statistiques...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      p={6}
      overflowY="auto"
      overflowX="hidden"
      height="100%"
      width="100%"
      css={{
        "& ::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Box mb={8}>
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white" mb={2}>
          Vos Statistiques
        </Text>
        <Text color="spotify.lightGray">
          Découvrez vos artistes et morceaux préférés
        </Text>
      </Box>

      {/* Sélection de la période */}
      <HStack gap={3} mb={6}>
        {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
          <Button
            key={range}
            size="sm"
            px={4}
            py={2}
            h="36px"
            fontSize="sm"
            fontWeight="medium"
            borderRadius="full"
            border="1px solid"
            borderColor={timeRange === range ? "transparent" : "whiteAlpha.300"}
            bg={timeRange === range ? "spotify.white" : "whiteAlpha.100"}
            color={timeRange === range ? "black" : "white"}
            onClick={() => handleTimeRangeChange(range)}
            transition="all 0.2s"
            _hover={{
              bg: timeRange === range ? "spotify.white" : "whiteAlpha.200",
              borderColor:
                timeRange === range ? "transparent" : "whiteAlpha.500",
            }}
          >
            {timeRangeLabels[range]}
          </Button>
        ))}
      </HStack>

      <Box mb={10}>
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white" mb={4}>
          Top 10 Artistes
        </Text>
        <Box position="relative" overflow="hidden">
          <Flex
            ref={artistsGridRef}
            gap={5}
            overflowX="auto"
            pb={4}
            opacity={dataLoading ? 0.5 : 1}
            transition="opacity 0.2s"
            css={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
            }}
          >
            {topArtists.map((artist, index) => (
              <VStack
                key={artist.id}
                minW="140px"
                gap={3}
                cursor="pointer"
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.05)" }}
              >
                <Box w="140px" h="140px">
                  <Image
                    src={artist.images[0]?.url || "/default-artist.png"}
                    alt={artist.name}
                    w="100%"
                    h="100%"
                    borderRadius="full"
                    objectFit="cover"
                    border="3px solid transparent"
                    transition="all 0.2s"
                    _groupHover={{ borderColor: "spotify.green" }}
                  />
                </Box>
                <Text
                  fontSize="sm"
                  color="spotify.white"
                  textAlign="center"
                  maxW="140px"
                  truncate
                >
                  <Text as="span" color="spotify.white" fontWeight="bold">
                    #{index + 1}.
                  </Text>{" "}
                  {artist.name}
                </Text>
              </VStack>
            ))}
          </Flex>
          {dataLoading && (
            <Center position="absolute" top={0} left={0} right={0} bottom={0}>
              <Spinner size="lg" color="spotify.green" />
            </Center>
          )}
          <Button
            position="absolute"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            w="44px"
            h="44px"
            minW="44px"
            p={0}
            borderRadius="full"
            bg="blackAlpha.800"
            color="white"
            onClick={() => scrollLeft(artistsGridRef)}
            disabled={!artistsCanScrollLeft}
            opacity={artistsCanScrollLeft ? 1 : 0}
            visibility={artistsCanScrollLeft ? "visible" : "hidden"}
            _hover={{ bg: "blackAlpha.900" }}
            _active={{ bg: "black" }}
          >
            <Icon as={FaChevronLeft} boxSize={4} />
          </Button>
          <Button
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
            w="44px"
            h="44px"
            minW="44px"
            p={0}
            borderRadius="full"
            bg="blackAlpha.800"
            color="white"
            onClick={() => scrollRight(artistsGridRef)}
            disabled={!artistsCanScrollRight}
            opacity={artistsCanScrollRight ? 1 : 0}
            visibility={artistsCanScrollRight ? "visible" : "hidden"}
            _hover={{ bg: "blackAlpha.900" }}
            _active={{ bg: "black" }}
          >
            <Icon as={FaChevronRight} boxSize={4} />
          </Button>
        </Box>
      </Box>

      <Box mb={10}>
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white" mb={4}>
          Top 10 Morceaux
        </Text>
        <Box position="relative" overflow="hidden">
          <Flex
            ref={tracksGridRef}
            gap={5}
            overflowX="auto"
            pb={4}
            opacity={dataLoading ? 0.5 : 1}
            transition="opacity 0.2s"
            css={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
            }}
          >
            {topTracks.map((track, index) => (
              <VStack key={track.id} minW="140px" gap={2} align="start">
                <Box w="140px" h="140px">
                  <Image
                    src={track.album.images[0]?.url || "/default-album.png"}
                    alt={track.album.name}
                    w="100%"
                    h="100%"
                    borderRadius="full"
                    objectFit="cover"
                    transition="transform 0.2s"
                    _hover={{ transform: "scale(1.05)" }}
                  />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="spotify.white"
                  maxW="140px"
                  truncate
                >
                  <Text as="span" color="spotify.white" fontWeight="bold">
                    #{index + 1}.
                  </Text>{" "}
                  {track.name}
                </Text>
                <Text
                  fontSize="xs"
                  color="spotify.lightGray"
                  maxW="140px"
                  truncate
                >
                  {track.artists[0]?.name}
                </Text>
              </VStack>
            ))}
          </Flex>
          {dataLoading && (
            <Center position="absolute" top={0} left={0} right={0} bottom={0}>
              <Spinner size="lg" color="spotify.green" />
            </Center>
          )}
          <Button
            position="absolute"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            w="44px"
            h="44px"
            minW="44px"
            p={0}
            borderRadius="full"
            bg="blackAlpha.800"
            color="white"
            onClick={() => scrollLeft(tracksGridRef)}
            disabled={!tracksCanScrollLeft}
            opacity={tracksCanScrollLeft ? 1 : 0}
            visibility={tracksCanScrollLeft ? "visible" : "hidden"}
            _hover={{ bg: "blackAlpha.900" }}
            _active={{ bg: "black" }}
          >
            <Icon as={FaChevronLeft} boxSize={4} />
          </Button>
          <Button
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
            w="44px"
            h="44px"
            minW="44px"
            p={0}
            borderRadius="full"
            bg="blackAlpha.800"
            color="white"
            onClick={() => scrollRight(tracksGridRef)}
            disabled={!tracksCanScrollRight}
            opacity={tracksCanScrollRight ? 1 : 0}
            visibility={tracksCanScrollRight ? "visible" : "hidden"}
            _hover={{ bg: "blackAlpha.900" }}
            _active={{ bg: "black" }}
          >
            <Icon as={FaChevronRight} boxSize={4} />
          </Button>
        </Box>
      </Box>

      <Box>
        <Text fontSize="xl" fontWeight="bold" color="spotify.white" mb={4}>
          5 Derniers Titres Écoutés
        </Text>
        <Flex
          gap={4}
          flexDir={{ base: "column", lg: "row" }}
          overflow="hidden"
          maxW="100%"
        >
          {/* Titre principal */}
          {recentlyPlayed[0] && (
            <Box flexShrink={0} w={{ base: "100%", lg: "160px" }}>
              <Image
                src={
                  recentlyPlayed[0].track.album.images[0]?.url ||
                  "/default-album.png"
                }
                alt={recentlyPlayed[0].track.album.name}
                w="160px"
                h="160px"
                borderRadius="md"
                objectFit="cover"
                mb={3}
                boxShadow="lg"
              />
              <VStack align="start" gap={0}>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="spotify.white"
                  lineHeight="short"
                  maxW="160px"
                  truncate
                >
                  {recentlyPlayed[0].track.name}
                </Text>
                <Text fontSize="sm" color="spotify.lightGray">
                  {recentlyPlayed[0].track.artists[0]?.name}
                </Text>
                <HStack gap={1} color="spotify.lightGray" fontSize="xs" mt={1}>
                  <Icon as={FaClock} boxSize={3} />
                  <Text>{formatTimeAgo(recentlyPlayed[0].played_at)}</Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Autres titres - en liste compacte */}
          <VStack flex={1} gap={1} align="stretch">
            {recentlyPlayed.slice(1).map((item, index) => (
              <Flex
                key={`${item.track.id}-${index}`}
                align="center"
                gap={3}
                p={2}
                bg="whiteAlpha.50"
                borderRadius="md"
                _hover={{ bg: "whiteAlpha.100" }}
                transition="background 0.2s"
              >
                <Image
                  src={item.track.album.images[0]?.url || "/default-album.png"}
                  alt={item.track.album.name}
                  w="40px"
                  h="40px"
                  borderRadius="sm"
                  objectFit="cover"
                  flexShrink={0}
                />
                <VStack flex={1} align="start" gap={0} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="spotify.white"
                    truncate
                    w="full"
                  >
                    {item.track.name}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="spotify.lightGray"
                    truncate
                    w="full"
                  >
                    {item.track.artists[0]?.name}
                  </Text>
                </VStack>
                <HStack
                  gap={1}
                  color="spotify.lightGray"
                  fontSize="xs"
                  flexShrink={0}
                >
                  <Icon as={FaClock} boxSize={3} />
                  <Text whiteSpace="nowrap">
                    {formatTimeAgo(item.played_at)}
                  </Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}
