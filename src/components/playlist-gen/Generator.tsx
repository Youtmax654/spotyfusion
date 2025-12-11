import StarsIcon from "@/icons/StarsIcon";
import type { Seed, TrackWithScore } from "@/schemas/Spotify";
import { Button, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import AudioFeatures from "./generator/AudioFeatures";
import Seeds from "./generator/Seeds";
import { getRecommendations } from "@/services/spotify.service";

interface Props {
  onRecommendationsChange: (recommendations: TrackWithScore[]) => void;
}

export default function Generator({ onRecommendationsChange }: Props) {
  const [audioFeatures, setAudioFeatures] = useState({
    danceability: [0.5],
    energy: [0.5],
    valence: [0.5],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedSeeds, setSelectedSeeds] = useState<Seed[]>([]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const recommendations = await getRecommendations({
        targets: audioFeatures,
        seeds: selectedSeeds
      });

      onRecommendationsChange(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSeeds = selectedSeeds.length > 0;

  return (
    <VStack alignItems={"start"} gap="24px">
      <Stack flexDirection="row" gap="24px" width="100%" height="100%">
        <AudioFeatures
          audioFeatures={audioFeatures}
          setAudioFeatures={setAudioFeatures}
        />
        <Seeds
          selectedSeeds={selectedSeeds}
          setSelectedSeeds={setSelectedSeeds}
        />
      </Stack>

      <Button
        bg={hasSeeds ? "white" : "gray.600"}
        color={hasSeeds ? "black" : "gray.400"}
        size="2xl"
        borderRadius="full"
        gap={2}
        onClick={handleGenerate}
        disabled={!hasSeeds}
        loading={isGenerating}
        cursor={hasSeeds ? "pointer" : "not-allowed"}
        _hover={hasSeeds ? { bg: "gray.100" } : {}}
        opacity={hasSeeds ? 1 : 0.6}
      >
        <Icon as={StarsIcon} boxSize={6} />
        <Text fontWeight="medium" fontSize="md">
          {hasSeeds
            ? "Générer les recommandations"
            : "Sélectionnez au moins une semence"}
        </Text>
      </Button>
    </VStack>
  );
}
