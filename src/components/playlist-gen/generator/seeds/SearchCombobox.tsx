import type { Seed, SpotifyArtist, SpotifyTrack } from "@/schemas/Spotify";
import { searchSpotify } from "@/services/spotify.service";
import {
  Combobox,
  createListCollection,
  HStack,
  Image,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

interface SearchResultItem {
  label: string;
  value: string;
  type: "artist" | "track";
  imageUrl: string | null;
  subLabel?: string;
}

interface Props {
  onSelectSeed: (seed: Seed) => void;
}
export default function SearchCombobox({ onSelectSeed }: Props) {
  const [items, setItems] = useState<SearchResultItem[]>([]);

  const collection = createListCollection({
    items: items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const handleSearchDebounced = useCallback(async (currentQuery: string) => {
    if (!currentQuery) return;
    try {
      const res = await searchSpotify(currentQuery, ["artist", "track"], 5);
      if (!res) return;

      const newItems: SearchResultItem[] = [];

      if (res.artists?.items) {
        res.artists.items.forEach((artist: SpotifyArtist) => {
          newItems.push({
            label: artist.name,
            value: artist.id,
            type: "artist",
            imageUrl: artist.images?.[0]?.url,
          });
        });
      }

      if (res.tracks?.items) {
        res.tracks.items.forEach((track: SpotifyTrack) => {
          newItems.push({
            label: track.name,
            value: track.id,
            type: "track",
            imageUrl: track.album.images?.[0]?.url,
          });
        });
      }

      setItems(newItems);
    } catch (error) {
      console.error("Erreur recherche Spotify", error);
    }
  }, []);

  const handleSelectItem = (item: SearchResultItem | null) => {
    if (!item) return;
    onSelectSeed({ type: item.type, id: item.value, name: item.label });
    setItems([]);
  };

  const artistItems = useMemo(
    () => items.filter((i) => i.type === "artist"),
    [items]
  );
  const trackItems = useMemo(
    () => items.filter((i) => i.type === "track"),
    [items]
  );

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={(e) => handleSearchDebounced(e.inputValue)}
      onValueChange={(e) => {
        if (e.items.length > 0) {
          handleSelectItem(e.items[0]);
        }
      }}
      openOnClick
      size="lg"
    >
      <Combobox.Control>
        <Combobox.Input
          borderColor={"spotify.border"}
          placeholder="Rechercher artistes ou pistes"
        />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>

      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>Pas de résultats</Combobox.Empty>

          {/* ARTISTS */}
          {artistItems.length > 0 && (
            <Combobox.ItemGroup>
              <Combobox.ItemGroupLabel
                color="gray.500"
                fontSize="xs"
                fontWeight="bold"
                mb={1}
                px={2}
              >
                ARTISTES
              </Combobox.ItemGroupLabel>
              {artistItems.map((item) => (
                <Combobox.Item
                  key={item.value}
                  item={item}
                  _hover={{ bg: "whiteAlpha.200" }}
                  borderRadius="md"
                  mb={1}
                >
                  <HStack gap={3}>
                    <Image
                      rounded="full"
                      src={item.imageUrl || ""}
                      boxSize="32px"
                    />
                    <Text fontWeight="medium" color="white">
                      {item.label}
                    </Text>
                  </HStack>
                </Combobox.Item>
              ))}
            </Combobox.ItemGroup>
          )}

          {artistItems.length > 0 && trackItems.length > 0 && (
            <Separator borderColor="spotify.border" />
          )}

          {/* TRACKS */}
          {trackItems.length > 0 && (
            <Combobox.ItemGroup>
              <Combobox.ItemGroupLabel
                color="gray.500"
                fontSize="xs"
                fontWeight="bold"
                mb={1}
                px={2}
              >
                PISTES
              </Combobox.ItemGroupLabel>
              {trackItems.map((item) => (
                <Combobox.Item
                  key={item.value}
                  item={item}
                  _hover={{ bg: "whiteAlpha.200" }}
                  borderRadius="md"
                  mb={1}
                >
                  <HStack gap={3}>
                    <Image
                      rounded="md"
                      src={item.imageUrl || ""}
                      boxSize="32px"
                    />
                    <Stack gap={0}>
                      <Text fontWeight="medium" color="white" lineClamp={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="xs" color="gray.400" lineClamp={1}>
                        {item.subLabel}
                      </Text>
                    </Stack>
                  </HStack>
                </Combobox.Item>
              ))}
            </Combobox.ItemGroup>
          )}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}
