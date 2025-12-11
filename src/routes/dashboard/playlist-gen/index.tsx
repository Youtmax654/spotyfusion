import type { TrackWithScore } from "@/schemas/Spotify";
import Generator from "@/components/playlist-gen/Generator";
import RecommendationsList from "@/components/playlist-gen/RecommendationsList";
import { Box, Text, VStack } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/playlist-gen/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [recommendations, setRecommendations] = useState<TrackWithScore[]>([]);

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
          Générateur de Playlists
        </Text>
        <Text fontSize="md" fontWeight="normal" color="spotify.lightGray">
          Créez des playlists personnalisées basées sur vos préférences
          musicales
        </Text>
      </Box>

      <Box width="100%">
        <Generator onRecommendationsChange={setRecommendations} />
      </Box>

      <Box width="100%">
        <RecommendationsList recommendations={recommendations} />
      </Box>
    </VStack>
  );
}
