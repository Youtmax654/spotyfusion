import SaveIcon from "@/icons/SaveIcon";
import { Button, Card, HStack, Icon, Text } from "@chakra-ui/react";
import RecommendationItem from "./recommendations-list/RecommendationItem";
import type { TrackWithScore } from "@/schemas/Spotify";
import { useState } from "react";
import {
  createPlaylist,
  addTracksToPlaylist,
  getUserProfile,
} from "@/services/spotify.service";
import { toaster } from "@/components/ui/toaster";

interface Props {
  recommendations: TrackWithScore[];
}
export default function RecommendationsList({ recommendations }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const savePlaylist = async () => {
    if (isSaving || recommendations.length === 0) return;

    setIsSaving(true);
    try {
      // Get user profile to get user ID
      const user = await getUserProfile();
      if (!user) {
        throw new Error("Failed to get user profile");
      }

      // Create playlist name with timestamp
      const playlistName = `SpotyFusion Recommendations - ${new Date().toLocaleDateString()}`;
      const playlistDescription = `Generated playlist with ${recommendations.length} recommendations based on your preferences.`;

      // Create the playlist
      const playlist = await createPlaylist(
        user.id,
        playlistName,
        playlistDescription,
        false
      );

      // Add tracks to the playlist
      const trackUris = recommendations.map(
        (item) => `spotify:track:${item.track.id}`
      );
      await addTracksToPlaylist(playlist.id, trackUris);

      toaster.create({
        title: "Playlist créée avec succès!",
        description: `${recommendations.length} morceaux ajoutés à "${playlistName}"`,
        type: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error saving playlist:", error);
      toaster.create({
        title: "Erreur lors de la création",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de créer la playlist",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            onClick={savePlaylist}
            loading={isSaving}
            disabled={recommendations.length === 0}
          >
            <Icon boxSize={6} color="black" as={SaveIcon} />
            {isSaving ? "Sauvegarde..." : "Sauvegarder la Playlist"}
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
