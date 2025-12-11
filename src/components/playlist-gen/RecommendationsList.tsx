import SaveIcon from "@/icons/SaveIcon";
import { Button, Card, HStack, Icon, Text } from "@chakra-ui/react";
import RecommendationItem from "./recommendations-list/RecommendationItem";
import type { TrackWithScore } from "@/schemas/Spotify";

interface Props {
  recommendations: TrackWithScore[];
}
export default function RecommendationsList({ recommendations }: Props) {
  return (
    <Card.Root width="100%" bg="spotify.darker" borderRadius="12px">
      <Card.Body padding="16px" gap="24px">
        <HStack justifyContent="space-between">
          <Text fontWeight="bold" fontSize="2xl">
            Recommandations ({recommendations.length})
          </Text>
          <Button
            px="24px"
            py="16px"
            fontSize="lg"
            borderRadius="full"
            size="2xl"
          >
            <Icon boxSize={6} color="black" as={SaveIcon} />
            Sauvegarder la Playlist
          </Button>
        </HStack>

        {recommendations.map((item, index) => (
          <RecommendationItem
            key={index}
            index={index + 1}
            track={item.track}
            score={item.score}
          />
        ))}
      </Card.Body>
    </Card.Root>
  );
}
