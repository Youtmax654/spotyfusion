import StarIcon from "@/icons/StarIcon";
import SaveIcon from "@/icons/SaveIcon";
import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading, Text, VStack, HStack, Slider, Input, Button, Wrap, WrapItem, Alert, Center, Tag, CloseButton, Spinner, Progress } from "@chakra-ui/react";
import { spotifyService } from "@/services/spotify.service";
import type { Track, RecommendationsError } from "@/schemas/Recommendations";

export const Route = createFileRoute("/dashboard/playlist-gen/")({
  component: RouteComponent,
});

function AudioSlider({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  description?: string;
}) {
  return (
    <Box mb={6}>
      <HStack justify="space-between" mb={2}>
        <Text fontWeight={500} color="#E6E6E6">{label}</Text>
        <Box bg="#E8E8E8" px={4} py={1} borderRadius="full">
          <Text fontSize="sm" fontWeight={500} color="#1A1A1A">{value.toFixed(2)}</Text>
        </Box>
      </HStack>
      <Slider.Root
        value={[value]}
        colorPalette="green"
        step={0.01}
        min={0}
        max={1}
        onValueChange={(details) => onChange(details.value[0])}
      >
        <Slider.Control>
          <Slider.Track bg="#2A2A2A" h="6px" borderRadius="full">
            <Slider.Range bg="#1DB954" />
          </Slider.Track>
          <Slider.Thumbs>
            <Slider.Thumb index={0} bg="#1DB954" boxSize={4} boxShadow="md" />
          </Slider.Thumbs>
        </Slider.Control>
      </Slider.Root>
      {description && (
        <Text fontSize="sm" color="gray.500" mt={3}>
          {description}
        </Text>
      )}
    </Box>
  );
}

function SeedTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <Tag.Root
      size="md"
      borderRadius="full"
      variant="solid"
      bg="#10B981"
      color="white"
      px={3}
      py={1}
    >
      <Tag.Label fontWeight={500}>{label}</Tag.Label>
      {onRemove && (
        <CloseButton
          aria-label={`Supprimer ${label}`}
          size="xs"
          ml={1}
          color="white"
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

  const suggestions = query
    ? apiSuggestions.filter(
      (g) => g.toLowerCase().includes(query.toLowerCase()) && !seeds.includes(g)
    )
    : popular.filter((g) => g.toLowerCase().includes(query.toLowerCase()) && !seeds.includes(g));

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
    // console.log("Generating with:", { danceability, energy, valence, seeds });
    setIsLoading(true);
    setError(null);
    setTracks([]);
    setSaveResult(null);
    setSaveError(null);

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
    <Box minH="100vh" bg="#121212" color="#E6E6E6" fontFamily="Inter, system-ui" p={6}>
      <VStack align="stretch" spaceX={4} spaceY={4}>
        <Box mb={4}>
          <Heading fontSize="2xl" fontWeight="bold" color="white">Générateur de Playlists</Heading>
          <Text color="gray.500" mt={2} lineHeight="1.6">
            Créez des playlists personnalisées basées sur vos<br />préférences musicales
          </Text>
        </Box>

        <HStack align="flex-start" spaceX={6} >
          <Box flex={1} minH="436px" bg="#1A1A1A" borderRadius="12px" p={6}>
            <Text fontSize="lg" fontWeight={600} mb={5} color="white">
              Caractéristiques Audio
            </Text>

            <AudioSlider label="Danceability" value={danceability} onChange={setDanceability} description="À quel point la musique est adaptée à la danse" />
            <AudioSlider label="Energy" value={energy} onChange={setEnergy} description="Intensité et activité de la musique" />
            <AudioSlider label="Valence (Positivité)" value={valence} onChange={setValence} description="Humeur positive ou négative de la musique" />
          </Box>

          <Box w="497px" minH="436px" bg="#1A1A1A" borderRadius="12px" p={6}>
            <Text fontSize="lg" fontWeight={600} mb={5} color="white">
              Semences
            </Text>

            <Box position="relative">
              <Input
                placeholder="Rechercher artistes, pistes ou genres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                bg="#2A2A2A"
                color="#E6E6E6"
                border="1px solid #3A3A3A"
                borderRadius="8px"
                h="48px"
                _placeholder={{ color: "#6B6B6B" }}
                _focus={{ borderColor: "#1DB954", boxShadow: "none" }}
              />
              {query && (
                <Box mt={2} bg="#2A2A2A" borderRadius="8px" p={2} boxShadow="0 6px 18px rgba(0,0,0,0.6)" zIndex={10} position="absolute" left={0} right={0}>
                  {suggestions.length ? (
                    <VStack align="stretch" spaceY={1}>
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

            <Box mt={5}>
              <Text color="gray.500" fontSize="sm" mb={3}>
                Genres populaires :
              </Text>
              <Wrap gap={2}>
                {popular.map((g) => (
                  <WrapItem key={g}>
                    <Button
                      size="sm"
                      bg="transparent"
                      color="#A0AEC0"
                      border="1px solid #4A5568"
                      borderRadius="full"
                      px={4}
                      h="32px"
                      fontWeight={400}
                      onClick={() => addSeed(g)}
                      _hover={{ bg: "rgba(255,255,255,0.05)", borderColor: "#718096" }}
                    >
                      {g}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Box mt={5}>
              <Text color="gray.500" fontSize="sm" mb={3}>
                Semences sélectionnées :
              </Text>
              <Wrap gap={2}>
                {seeds.map((s) => (
                  <WrapItem key={s}>
                    <SeedTag label={s} onRemove={() => removeSeed(s)} />
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Alert.Root status="info" mt={5} borderRadius="8px" bg="#0D3B2E" py={3} px={4}>
              <Alert.Indicator color="#10B981" />
              <Text fontSize="sm" color="#A7F3D0" ml={2}>
                Ajoutez jusqu'à 5 semences (artistes, pistes ou genres) pour personnaliser vos recommandations
              </Text>
            </Alert.Root>
          </Box>
        </HStack>

        <Box mt={4}>
          <Button bg="#ffffffff" color="#061014" borderRadius="28px" onClick={generate} _hover={{ opacity: 0.9 }}>
            <StarIcon /> Générer les recommandations
          </Button>
        </Box>

        <Box>
          <Box bg="#1A1A1A" borderRadius="12px" p={6} minH="160px">
            {/* Header avec titre et bouton Sauvegarder */}
            <HStack justify="space-between" align="center" mb={4}>
              <Text fontWeight={700} fontSize="xl" color="#E6E6E6">
                Recommandations {tracks.length > 0 && `(${tracks.length})`}
              </Text>

              {/* Bouton Sauvegarder - visible uniquement quand il y a des tracks */}
              {tracks.length > 0 && !isLoading && !saveResult && (
                <Button
                  bg="white"
                  color="#1a1a1a"
                  borderRadius="24px"
                  px={5}
                  py={2}
                  onClick={savePlaylist}
                  disabled={isSaving}
                  _hover={{ bg: "#f0f0f0" }}
                  _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                  fontWeight={500}
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" mr={2} color="#1a1a1a" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <SaveIcon boxSize={5} mr={2} />
                      Sauvegarder la Playlist
                    </>
                  )}
                </Button>
              )}
            </HStack>

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
              <Box>
                {tracks.map((track, index) => (
                  <Box
                    key={track.id}
                    display="flex"
                    alignItems="center"
                    py={4}
                    px={4}
                    mb={2}
                    border="1px solid #3A3A3A"
                    borderRadius="8px"
                    _hover={{ bg: "rgba(255,255,255,0.02)", borderColor: "#4A4A4A" }}
                    transition="all 0.2s"
                  >
                    {/* Numéro de ligne */}
                    <Text w="40px" color="gray.500" fontSize="sm" textAlign="center" flexShrink={0}>
                      {index + 1}
                    </Text>

                    {/* Image album + Titre/Artiste */}
                    <HStack flex={1} minW={0} gap={3}>
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
                      <Box minW={0}>
                        <Text fontWeight={600} color="white" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {track.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {track.artist}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Artiste (colonne séparée) */}
                    <Text w="180px" color="gray.400" fontSize="sm" textAlign="center" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flexShrink={0}>
                      {track.artist}
                    </Text>

                    {/* Durée (simulée) */}
                    <Text w="60px" color="gray.400" fontSize="sm" textAlign="center" flexShrink={0}>
                      {`${Math.floor(Math.random() * 2) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`}
                    </Text>

                    {/* Score Energy avec icône wave */}
                    <HStack w="80px" justify="flex-end" flexShrink={0}>
                      <Text color="#1DB954" fontSize="sm">〰</Text>
                      <Box bg="#1DB954" px={2} py={0.5} borderRadius="full">
                        <Text fontSize="xs" fontWeight={600} color="white">
                          {track.energyScore.toFixed(2)}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </Box>
            )}

            {/* Messages de confirmation/erreur */}
            {tracks.length > 0 && !isLoading && (saveResult || saveError) && (
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
                  <Alert.Root status="error" borderRadius="8px" bg="#3B1219" color="#FCA5A5">
                    <Alert.Indicator />
                    <Box>
                      <Alert.Title>Erreur de sauvegarde</Alert.Title>
                      <Alert.Description>{saveError}</Alert.Description>
                    </Box>
                  </Alert.Root>
                ) : null}
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}
