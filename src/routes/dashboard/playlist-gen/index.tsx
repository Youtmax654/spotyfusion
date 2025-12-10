import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading, Text, VStack, HStack, Slider, SliderTrack, SliderThumb, Input, Button, Wrap, WrapItem, Alert, Center, IconButton, Tag, CloseButton, Spinner, Progress } from "@chakra-ui/react";
import { spotifyService } from "@/services/spotify.service";
import type { Track, RecommendationsError } from "@/schemas/Recommendations";

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
  const [seeds, setSeeds] = useState<string[]>([]);

  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const searchAbortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!query) {
      setApiSuggestions([]);
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setApiSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      const q = encodeURIComponent(query);
      const url = `https://api.spotify.com/v1/search?q=${q}&type=artist%2Ctrack`;
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Spotify search error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const artists = (data.artists?.items || []).map(
            (a: any) => `Artist: ${a.name}`
          );
          const tracks = (data.tracks?.items || []).map(
            (t: any) =>
              `Track: ${t.name} — ${t.artists?.map((x: any) => x.name).join(", ")}`
          );
          // prefer tracks first
          setApiSuggestions([...tracks, ...artists]);
        })
        .catch((err) => {
          if ((err as any).name !== "AbortError") {
            console.error("Spotify search failed", err);
            setApiSuggestions([]);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
        searchAbortRef.current = null;
      }
    };
  }, [query]);

  // suggestions now use API when query present, otherwise fallback to popular
  const suggestions = query
    ? apiSuggestions.filter(
      (g) => g.toLowerCase().includes(query.toLowerCase()) && !seeds.includes(g)
    )
    : popular.filter((g) => g.toLowerCase().includes(query.toLowerCase()) && !seeds.includes(g));
  // --- end new code ---

  function addSeed(s: string) {
    if (seeds.length >= 5) return;
    setSeeds((p) => (p.includes(s) ? p : [...p, s]));
    setQuery("");
  }
  function removeSeed(s: string) {
    setSeeds((p) => p.filter((x) => x !== s));
  }

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RecommendationsError | null>(null);

  async function generate() {
    console.log("Generating with:", { danceability, energy, valence, seeds });
    setIsLoading(true);
    setError(null);
    setTracks([]);

    try {
      const result = await spotifyService.generateRecommendations({
        seeds,
        danceability,
        energy,
        valence,
        limit: 30,
      });
      setTracks(result);
    } catch (err) {
      const recommendationsError = err as RecommendationsError;
      if (recommendationsError.status === 400) {
        setError(recommendationsError);
      } else {
        setError({
          status: 500,
          message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Save playlist states
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ url: string; count: number } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function savePlaylist() {
    setIsSaving(true);
    setSaveResult(null);
    setSaveError(null);

    try {
      // Récupérer l'utilisateur courant
      const user = await spotifyService.getUserProfile();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Générer un nom de playlist avec la date
      const now = new Date();
      const playlistName = `SpotifyFusion - ${now.toLocaleDateString("fr-FR")}`;

      const result = await spotifyService.savePlaylist(
        user.id,
        playlistName,
        tracks,
        `Playlist générée avec ${seeds.join(", ")} • Energy: ${Math.round(energy * 100)}%`
      );

      setSaveResult({
        url: result.playlistUrl,
        count: result.tracksAdded,
      });
    } catch (err) {
      const errorMessage = (err as { message?: string })?.message || "Impossible de sauvegarder la playlist.";
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
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
                placeholder="Rechercher artistes ou pistes..."
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

            {isLoading ? (
              <Center flexDirection="column" color="gray.400" py={6}>
                <Spinner size="lg" color="#10B981" mb={4} />
                <Text fontWeight={700} color="#E6E6E6" mb={2}>Génération en cours...</Text>
                <Text textAlign="center" maxW="560px" fontSize="sm">
                  Recherche de titres correspondant à vos critères
                </Text>
              </Center>
            ) : error ? (
              <Alert.Root status="error" borderRadius="8px" bg="#3B1219" color="#FCA5A5">
                <Alert.Indicator />
                <Box>
                  <Alert.Title>Erreur {error.status}</Alert.Title>
                  <Alert.Description>{error.message}</Alert.Description>
                </Box>
              </Alert.Root>
            ) : tracks.length === 0 ? (
              <Center flexDirection="column" color="gray.400" py={6}>
                <Text fontSize="3xl" mb={2}>♫</Text>
                <Text fontWeight={700} color="#E6E6E6" mb={2}>Aucune recommandation pour le moment</Text>
                <Text textAlign="center" maxW="560px" fontSize="sm">
                  Configurez vos préférences et ajoutez des semences, puis cliquez sur "Générer les recommandations"
                </Text>
              </Center>
            ) : (
              <VStack align="stretch" spaceY={2}>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  {tracks.length} titre{tracks.length > 1 ? "s" : ""} trouvé{tracks.length > 1 ? "s" : ""}
                </Text>
                {tracks.map((track) => (
                  <Box
                    key={track.id}
                    bg="#061014"
                    borderRadius="8px"
                    p={4}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    _hover={{ bg: "#0A1A1F" }}
                    transition="background 0.2s"
                  >
                    {track.albumImageUrl && (
                      <img
                        src={track.albumImageUrl}
                        alt={track.album}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "4px",
                          flexShrink: 0,
                          objectFit: "cover"
                        }}
                      />
                    )}
                    <Box flex={1} minW={0}>
                      <Text fontWeight={600} color="#E6E6E6" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {track.name}
                      </Text>
                      <Text fontSize="sm" color="gray.400" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {track.artist}
                      </Text>
                    </Box>
                    <Box w="120px" flexShrink={0}>
                      <Text fontSize="xs" color="gray.400" mb={1}>
                        Energy: {Math.round(track.energyScore * 100)}%
                      </Text>
                      <Progress.Root value={track.energyScore * 100} size="sm" borderRadius="full">
                        <Progress.Track bg="#1A2A2A">
                          <Progress.Range bg="#10B981" />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Bouton Sauvegarder et messages */}
            {tracks.length > 0 && !isLoading && (
              <Box mt={6}>
                {saveResult ? (
                  <Alert.Root status="success" borderRadius="8px" bg="#063F2F" color="#A7F3D0">
                    <Alert.Indicator />
                    <Box flex={1}>
                      <Alert.Title>Playlist sauvegardée avec succès !</Alert.Title>
                      <Alert.Description>
                        {saveResult.count} titre{saveResult.count > 1 ? "s" : ""} ajouté{saveResult.count > 1 ? "s" : ""}.{" "}
                        <a
                          href={saveResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline", fontWeight: 600 }}
                        >
                          Ouvrir dans Spotify →
                        </a>
                      </Alert.Description>
                    </Box>
                  </Alert.Root>
                ) : saveError ? (
                  <Alert.Root status="error" borderRadius="8px" bg="#3B1219" color="#FCA5A5" mb={4}>
                    <Alert.Indicator />
                    <Box>
                      <Alert.Title>Erreur de sauvegarde</Alert.Title>
                      <Alert.Description>{saveError}</Alert.Description>
                    </Box>
                  </Alert.Root>
                ) : null}

                {!saveResult && (
                  <Button
                    bg="#1DB954"
                    color="white"
                    borderRadius="28px"
                    onClick={savePlaylist}
                    disabled={isSaving}
                    _hover={{ opacity: 0.9 }}
                    _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                    mt={saveError ? 4 : 0}
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" mr={2} />
                        Sauvegarde en cours...
                      </>
                    ) : (
                      "💾 Sauvegarder la Playlist"
                    )}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}
