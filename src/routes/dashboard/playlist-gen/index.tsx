import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading, Text, VStack, HStack, Slider, SliderTrack, SliderThumb, Input, Button, Wrap, WrapItem, Alert, List, ListItem, Center, IconButton, Tag, CloseButton } from "@chakra-ui/react";

export const Route = createFileRoute("/dashboard/playlist-gen/")({
  component: RouteComponent,
});

function AudioSlider({
  label,
  onChange,
  description,
}: {
  label: string;
  onChange: (v: number) => void;
  description?: string;
}) {
  return (
    <Box bg="#0B1113" borderRadius="10px" p={3} mb={3}>
      <Slider.Root defaultValue={[0.5]} variant="solid" key={label} colorPalette="green" step={0.01} min={0} max={1} onChange={(v) => onChange(Number(v.nativeEvent.target.value))}>
        <HStack justify="space-between">
          <Slider.Label>{label}</Slider.Label>
          <Slider.ValueText />
        </HStack>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
      </Slider.Root>

      <HStack justify="space-between" mb={2}>
        <Box>
          {description && (
            <Text fontSize="sm" color="gray.400">
              {description}
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
}

function SeedTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <Tag.Root
      size="md"
      borderRadius="full"
      variant="solid"
      bg="#063F2F"
      color="#D1FAE5"
      mr={2}
    >
      <Tag.Label>{label}</Tag.Label>
      {onRemove && (
        <CloseButton
          aria-label={`Supprimer ${label}`}
          size="sm"
          ml={2}
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        />
      )}
    </Tag.Root>
  );
}

function RouteComponent() {
  const [danceability, setDanceability] = useState(0.5);
  const [energy, setEnergy] = useState(0.5);
  const [valence, setValence] = useState(0.5);

  const popular = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "Electronic",
    "Jazz",
    "Classical",
    "R&B",
    "Country",
  ];
  const [query, setQuery] = useState("");
  const [seeds, setSeeds] = useState<string[]>(["Rock", "Electronic"]);
  const suggestions = popular.filter(
    (g) => g.toLowerCase().includes(query.toLowerCase()) && !seeds.includes(g)
  );

  function addSeed(s: string) {
    if (seeds.length >= 5) return;
    setSeeds((p) => (p.includes(s) ? p : [...p, s]));
    setQuery("");
  }
  function removeSeed(s: string) {
    setSeeds((p) => p.filter((x) => x !== s));
  }

  const [generated, setGenerated] = useState<string[] | null>(null);
  function generate() {
    console.log("Generating with:", { danceability, energy, valence, seeds });
    setGenerated(null);
    setTimeout(() => {
      if (seeds.length === 0) {
        setGenerated([]);
      } else {
        setGenerated([`Track 1 — ${seeds[0]}`, `Track 2 — ${seeds[seeds.length - 1]}`, `Track 3 — Mix`]);
      }
    }, 600);
  }

  return (
    <Box minH="100vh" bg="#0B0E0F" color="#E6E6E6" fontFamily="Inter, system-ui" p={6}>
      <VStack align="stretch" spaceX={4} spaceY={4}>
        <Box>
          <Heading fontSize="lg">Générateur de Playlists</Heading>
          <Text color="gray.400" mt={2}>
            Créez des playlists personnalisées basées sur vos préférences musicales
          </Text>
        </Box>

        <HStack align="flex-start" spaceX={6} spaceY={6}>
          <Box flex={1} bg="#0F1720" borderRadius="12px" p={5} boxShadow="0 1px 0 rgba(255,255,255,0.02)">
            <Text fontSize="md" fontWeight={700} mb={3}>
              Caractéristiques Audio
            </Text>

            <AudioSlider label="Danceability" onChange={setDanceability} description="À quel point la musique est adaptée à la danse" />
            <AudioSlider label="Energy" onChange={setEnergy} description="Intensité et activité de la musique" />
            <AudioSlider label="Valence (Positivité)" onChange={setValence} description="Humeur positive ou négative de la musique" />
          </Box>

          <Box w="360px" bg="#0F1720" borderRadius="12px" p={5} boxShadow="0 1px 0 rgba(255,255,255,0.02)">
            <Text fontSize="md" fontWeight={700} mb={3}>
              Semences
            </Text>

            <Box position="relative">
              <Input
                placeholder="Rechercher artistes, pistes ou genres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                bg="#061014"
                color="#E6E6E6"
                borderColor="rgba(255,255,255,0.04)"
              />
              {query && (
                <Box mt={2} bg="#061014" borderRadius="8px" p={2} boxShadow="0 6px 18px rgba(0,0,0,0.6)" zIndex={10} position="absolute" left={0} right={0}>
                  {suggestions.length ? (
                    <VStack align="stretch" spaceX={1} spaceY={1}>
                      {suggestions.map((s) => (
                        <Button key={s} variant="ghost" justifyContent="flex-start" onClick={() => addSeed(s)} color="#E6E6E6">
                          {s}
                        </Button>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.400" p={2}>
                      Aucune suggestion
                    </Text>
                  )}
                </Box>
              )}
            </Box>

            <Box mt={4}>
              <Text color="gray.400" fontSize="sm" mb={2}>
                Genres populaires :
              </Text>
              <Wrap>
                {popular.map((g) => (
                  <WrapItem key={g}>
                    <Button size="sm" bg="#0B1113" color="#D1FAE5" borderRadius="999px" onClick={() => addSeed(g)} >
                      {g}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Box mt={4}>
              <Text color="gray.400" fontSize="sm" mb={2}>
                Semences sélectionnées :
              </Text>
              <Wrap>
                {seeds.map((s) => (
                  <WrapItem key={s}>
                    <SeedTag label={s} onRemove={() => removeSeed(s)} />
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Alert.Root status="info" mt={4} borderRadius="8px" bg="#07281D" color="#A7F3D0">
              <Alert.Indicator />
              <Alert.Title>Ajoutez jusqu'à 5 semences (artistes, pistes ou genres) pour personnaliser vos recommandations</Alert.Title>
            </Alert.Root>
          </Box>
        </HStack>

        <Box mt={4}>
          <Button bg="#10B981" color="#061014" borderRadius="28px" onClick={generate} _hover={{ opacity: 0.9 }}>
            🎧 Générer les recommandations
          </Button>
        </Box>

        <Box>
          <Box bg="#0F1720" borderRadius="12px" p={6} minH="160px">
            <Text fontWeight={700} mb={4} color="#E6E6E6">
              Recommandations
            </Text>

            {generated === null ? (
              <Center flexDirection="column" color="gray.400" py={6}>
                <Text fontSize="3xl" mb={2}>♫</Text>
                <Text fontWeight={700} color="#E6E6E6" mb={2}>Aucune recommandation pour le moment</Text>
                <Text textAlign="center" maxW="560px" fontSize="sm">
                  Configurez vos préférences et ajoutez des semences, puis cliquez sur "Générer les recommandations"
                </Text>
              </Center>
            ) : generated.length === 0 ? (
              <Center flexDirection="column" color="gray.400" py={6}>
                <Text fontSize="3xl" mb={2}>⚠️</Text>
                <Text fontWeight={700} color="#E6E6E6" mb={2}>Aucune recommandation trouvée</Text>
                <Text textAlign="center" maxW="560px" fontSize="sm">Essayez d'ajouter d'autres semences ou d'ajuster les sliders</Text>
              </Center>
            ) : (
              <List.Root spaceX={3} spaceY={3}>
                {generated.map((t) => (
                  <List.Item key={t} bg="#061014" borderRadius="8px" p={3} color="#D1FAE5">
                    {t}
                  </List.Item>
                ))}
              </List.Root>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}
