import type { Seed } from "@/schemas/Spotify";
import { Alert, Card, Text } from "@chakra-ui/react";
import type { Dispatch, SetStateAction } from "react";
import GenresList from "./seeds/GenresList";
import SearchCombobox from "./seeds/SearchCombobox";
import SelectedSeeds from "./seeds/SelectedSeeds";

interface Props {
  selectedSeeds: Seed[];
  setSelectedSeeds: Dispatch<SetStateAction<Seed[]>>;
}
export default function Seeds({ selectedSeeds, setSelectedSeeds }: Props) {
  const handleSelectSeed = (seed: Seed) => {
    if (selectedSeeds.find((s) => s.id === seed.id)) return;
    if (selectedSeeds.length >= 5) return;
    setSelectedSeeds([...selectedSeeds, seed]);
  };

  const handleRemoveSeed = (seedId: string) => {
    setSelectedSeeds(selectedSeeds.filter((s) => s.id !== seedId));
  };

  return (
    <Card.Root width="100%" bg="spotify.darker" borderRadius="12px">
      <Card.Body padding="16px" gap="24px">
        <Text fontWeight="bold" fontSize="xl">
          Semences
        </Text>

        <SearchCombobox onSelectSeed={handleSelectSeed} />
        <GenresList
          selectedSeeds={selectedSeeds}
          onSelectSeed={handleSelectSeed}
        />
        <SelectedSeeds
          selectedSeeds={selectedSeeds}
          onRemoveSeed={handleRemoveSeed}
        />

        <Alert.Root bg="spotify.green/10">
          <Alert.Indicator color="spotify.green" />
          <Alert.Title fontSize="sm" fontWeight="normal" color="white">
            Ajoutez jusqu'à 5 semences (artistes, pistes ou genres) pour
            personnaliser vos recommandations
          </Alert.Title>
        </Alert.Root>
      </Card.Body>
    </Card.Root>
  );
}
