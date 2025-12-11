import type { Seed } from "@/schemas/Spotify";
import { Badge, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { CgClose } from "react-icons/cg";

interface Props {
  selectedSeeds: Array<Seed>;
  onRemoveSeed: (seedId: Seed["id"]) => void;
}
export default function SelectedSeeds({ selectedSeeds, onRemoveSeed }: Props) {
  return (
    <VStack gap="8px" align="start">
      <Text fontWeight="normal" fontSize="sm" color="spotify.lightGray">
        Semences sélectionnées :
      </Text>
      <HStack gap="8px" width="100%">
        {selectedSeeds.length === 0 && (
          <Badge h="32px" fontSize="sm" bg="spotify.lightGray" color="black">
            Aucune semence sélectionnée
          </Badge>
        )}
        {selectedSeeds.map((seed) => (
          <Badge
            key={seed.id}
            fontSize="sm"
            h="32px"
            color="black"
            bg="spotify.green"
            borderRadius="full"
            paddingX="12px"
            cursor="pointer"
            onClick={() => onRemoveSeed(seed.id)}
          >
            {seed.name}
            <Icon as={CgClose} />
          </Badge>
        ))}
      </HStack>
    </VStack>
  );
}
