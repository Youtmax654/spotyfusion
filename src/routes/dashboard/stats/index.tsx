import TopArtistsList from "@/components/stats/artists/TopArtistsList";
import LastListened from "@/components/stats/lastListened/LastListened";
import TimeRange from "@/components/stats/TimeRange";
import TopTracksList from "@/components/stats/tracks/TopTracksList";
import { statsSearchSchema } from "@/schemas/TimeRange";
import { getRecentlyPlayed } from "@/services/player.service";
import { getTopArtists, getTopTracks } from "@/services/spotify.service";
import { Box, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/stats/")({
  validateSearch: (search) => statsSearchSchema.parse(search),
  loaderDeps: ({ search: { range } }) => ({ range }),
  loader: async ({ deps: { range } }) => {
    const [topArtists, topTracks, recentlyPlayed] = await Promise.all([
      getTopArtists(range, 10),
      getTopTracks(range, 10),
      getRecentlyPlayed(5),
    ]);

    return { topArtists, topTracks, recentlyPlayed };
  },
  component: StatsPage,
});

function StatsPage() {
  const { topArtists, topTracks, recentlyPlayed } = Route.useLoaderData();

  return (
    <VStack
      align="start"
      overflowY="auto"
      overflowX="hidden"
      height="100%"
      width="100%"
      gap="32px"
      p={4}
      css={{
        "& ::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Box gap={2}>
        <Text fontSize="4xl" fontWeight="bold" color="spotify.white">
          Vos Statistiques
        </Text>
        <Text fontSize="md" fontWeight="normal" color="spotify.lightGray">
          Découvrez vos artistes et morceaux préférés
        </Text>
      </Box>

      <HStack gap={2}>
        <TimeRange />
      </HStack>

      <Stack direction="column" gap={6} width="100%">
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white">
          Top 10 Artistes
        </Text>
        <TopArtistsList topArtists={topArtists} />
      </Stack>

      <Stack direction="column" gap={6} width="100%">
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white">
          Top 10 Morceaux
        </Text>
        <TopTracksList topTracks={topTracks} />
      </Stack>

      <Stack direction="column" width="100%" gap={6}>
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white">
          5 Derniers Titres Écoutés
        </Text>
        <LastListened recentlyPlayed={recentlyPlayed} />
      </Stack>
    </VStack>
  );
}
