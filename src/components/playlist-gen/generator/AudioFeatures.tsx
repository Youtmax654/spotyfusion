import { Card, Text } from "@chakra-ui/react";
import FeatureSlider from "./audio-features/FeatureSlider";

interface Props {
  audioFeatures: {
    danceability: number[];
    energy: number[];
    valence: number[];
  };
  setAudioFeatures: React.Dispatch<
    React.SetStateAction<{
      danceability: number[];
      energy: number[];
      valence: number[];
    }>
  >;
}
export default function AudioFeatures({
  audioFeatures,
  setAudioFeatures,
}: Props) {
  const setDanceability = (value: number[]) => {
    setAudioFeatures((prev) => ({ ...prev, danceability: value }));
  };

  const setEnergy = (value: number[]) => {
    setAudioFeatures((prev) => ({ ...prev, energy: value }));
  };

  const setValence = (value: number[]) => {
    setAudioFeatures((prev) => ({ ...prev, valence: value }));
  };

  return (
    <Card.Root width="100%" bg="spotify.darker" borderRadius="12px">
      <Card.Body padding="16px" gap="24px">
        <Text fontWeight="bold" fontSize="xl">
          Caractéristiques Audio
        </Text>

        <FeatureSlider
          value={audioFeatures.danceability}
          onChange={setDanceability}
          label="Danceability"
          description="À quel point la musique est adaptée à la danse"
        />

        <FeatureSlider
          value={audioFeatures.energy}
          onChange={setEnergy}
          label="Energy"
          description="Intensité et activité de la musique"
        />

        <FeatureSlider
          value={audioFeatures.valence}
          onChange={setValence}
          label="Valence (Positivité)"
          description="Humeur positive ou négative de la musique"
        />
      </Card.Body>
    </Card.Root>
  );
}
