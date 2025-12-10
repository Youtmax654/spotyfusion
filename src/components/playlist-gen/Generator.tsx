import StarsIcon from "@/icons/StarsIcon";
import type { Seed } from "@/schemas/Spotify";
import { Button, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import AudioFeatures from "./generator/AudioFeatures";
import Seeds from "./generator/Seeds";

export default function Generator() {
  const [audioFeatures, setAudioFeatures] = useState({
    danceability: [0.5],
    energy: [0.5],
    valence: [0.5],
  });

  const [selectedSeeds, setSelectedSeeds] = useState<Seed[]>([]);

  const handleGenerate = () => {
    // Logic to generate playlist recommendations based on audio features and seeds
  };

  return (
    <VStack alignItems={"start"} gap="24px">
      <HStack gap="24px" width="100%" height="100%">
        <AudioFeatures
          audioFeatures={audioFeatures}
          setAudioFeatures={setAudioFeatures}
        />
        <Seeds
          selectedSeeds={selectedSeeds}
          setSelectedSeeds={setSelectedSeeds}
        />
      </HStack>

      <Button
        bg="white"
        width="322px"
        height="63px"
        borderRadius="full"
        gap={2}
        onClick={handleGenerate}
      >
        <Icon as={StarsIcon} boxSize={6} color="black" />
        <Text color="black" fontWeight="medium" fontSize="md">
          Générer les recommandations
        </Text>
      </Button>
    </VStack>
  );
}
