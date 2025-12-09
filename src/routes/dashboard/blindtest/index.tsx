import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Text, VStack, HStack, Button, Image, Grid, Center } from '@chakra-ui/react';
import { FaPlay, FaTimes, FaCheck, FaLock } from 'react-icons/fa';
import { getUserPlaylists, getPlaylistTracks } from '../../../services/spotify.service';
import type { SpotifyPlaylist, SpotifyTrack } from '../../../services/spotify.service';
import { useSpotifyPlayer } from '../../../hooks/useSpotifyPlayer';

export const Route = createFileRoute('/dashboard/blindtest/')({
  component: BlindTestPage,
});

type GameState = 'setup' | 'playing' | 'results';

interface GameQuestion {
  correctTrack: SpotifyTrack;
  choices: SpotifyTrack[];
}

interface PlayedTrack {
  track: SpotifyTrack;
  wasCorrect: boolean;
}

const QUESTIONS_PER_GAME = 10;
const TIME_PER_QUESTION = 30;

function BlindTestPage() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  // Game state
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [playedTracks, setPlayedTracks] = useState<PlayedTrack[]>([]);
  const [answered, setAnswered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spotify Web Playback SDK
  const { isReady, error: playerError, play, pause, activatePlayer, reconnect } = useSpotifyPlayer();

  // Auto-reconnect if player is not ready when page loads
  useEffect(() => {
    if (!isReady && !playerError && !loading) {
      console.log('🔄 BlindTest: Player not ready, attempting reconnect...');
      reconnect();
    }
  }, [isReady, playerError, loading, reconnect]);

  // Load playlists
  useEffect(() => {
    const loadData = async () => {
      try {
        const playlistsData = await getUserPlaylists();
        setPlaylists(playlistsData.filter(p => p.tracks.total >= 10));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || answered) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - process as wrong answer
          clearInterval(timerRef.current!);
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            if (!answered) {
              processAnswer(null);
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, answered, currentQuestionIndex]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = async () => {
    if (!selectedPlaylist) return;

    if (!isReady) {
      alert('Le lecteur Spotify n\'est pas prêt. Assurez-vous d\'avoir un compte Premium et que le SDK est chargé.');
      return;
    }

    // Activate player element (needed for browsers)
    await activatePlayer();

    setLoading(true);

    try {
      const tracks = await getPlaylistTracks(selectedPlaylist.id);
      if (tracks.length < 4) {
        alert('Cette playlist n\'a pas assez de morceaux.');
        setLoading(false);
        return;
      }

      const shuffledTracks = shuffleArray(tracks);
      const gameQuestions: GameQuestion[] = [];

      for (let i = 0; i < Math.min(QUESTIONS_PER_GAME, shuffledTracks.length); i++) {
        const correctTrack = shuffledTracks[i];
        const wrongChoices = shuffleArray(
          shuffledTracks.filter(t => t.id !== correctTrack.id)
        ).slice(0, 3);

        const choices = shuffleArray([correctTrack, ...wrongChoices]);
        gameQuestions.push({ correctTrack, choices });
      }

      setQuestions(gameQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(TIME_PER_QUESTION);
      setPlayedTracks([]);
      setAnswered(false);
      setGameState('playing');

      // Start playing the first track
      const trackUri = `spotify:track:${gameQuestions[0].correctTrack.id}`;
      const success = await play(trackUri);
      if (!success) {
        console.error('Failed to start first track');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Erreur lors du démarrage du jeu.');
    } finally {
      setLoading(false);
    }
  };

  const processAnswer = async (selectedTrack: SpotifyTrack | null) => {
    setAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    await pause();

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedTrack?.id === currentQuestion.correctTrack.id;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3);
      setScore(prev => prev + 3 + timeBonus);
    }

    setPlayedTracks(prev => [...prev, {
      track: currentQuestion.correctTrack,
      wasCorrect: isCorrect
    }]);

    // Move to next question after a short delay
    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setAnswered(false);
        const nextQuestion = questions[currentQuestionIndex + 1];
        if (nextQuestion) {
          const trackUri = `spotify:track:${nextQuestion.correctTrack.id}`;
          await play(trackUri);
        }
      } else {
        setGameState('results');
      }
    }, 1500);
  };

  const handleAnswer = (selectedTrack: SpotifyTrack | null) => {
    if (answered) return;
    processAnswer(selectedTrack);
  };

  const resetGame = async () => {
    await pause();
    setGameState('setup');
    setSelectedPlaylist(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setPlayedTracks([]);
  };

  // Cleanup on unmount - stop music when leaving the page
  useEffect(() => {
    return () => {
      // Stop any playing music when unmounting
      pause();
      // Clear any running timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pause]);

  const renderSetup = () => (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
        Blind Test
      </Text>
      <Text color="#b3b3b3" mb={8}>
        Testez vos connaissances musicales en devinant les morceaux
      </Text>

      {/* Conteneur avec position relative pour l'overlay */}
      <Box position="relative" minH="70vh">
        <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
          Mes playlists
        </Text>

        {loading ? (
          <Center py={10}>
            <Text color="#b3b3b3">Chargement...</Text>
          </Center>
        ) : (
          <>
            <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={4} mb={8}>
              {playlists.map(playlist => (
                <Box
                  key={playlist.id}
                  cursor="pointer"
                  onClick={() => setSelectedPlaylist(playlist)}
                  position="relative"
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.05)' }}
                >
                  <Image
                    src={playlist.images[0]?.url || '/placeholder.png'}
                    alt={playlist.name}
                    borderRadius="md"
                    w="100%"
                    aspectRatio={1}
                    objectFit="cover"
                  />
                  {selectedPlaylist?.id === playlist.id && (
                    <Center
                      position="absolute"
                      bottom={2}
                      right={2}
                      w={6}
                      h={6}
                      bg="#1db954"
                      borderRadius="full"
                    >
                      <FaCheck size={12} color="black" />
                    </Center>
                  )}
                  <Text
                    color="white"
                    fontSize="sm"
                    mt={2}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {playlist.name}
                  </Text>
                </Box>
              ))}
            </Grid>

            <Button
              onClick={startGame}
              disabled={!selectedPlaylist || loading || !isReady}
              bg="white"
              color="black"
              borderRadius="full"
              px={6}
              py={5}
              fontWeight="semibold"
              fontSize="sm"
              _hover={{ bg: 'gray.100' }}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed', bg: 'gray.400' }}
            >
              <FaPlay style={{ marginRight: 10 }} size={12} />
              {loading ? 'Chargement...' : isReady ? 'Commencer le Blind Test' : 'Lecteur non prêt'}
            </Button>
          </>
        )}

        {/* Overlay flou uniquement sur cette section */}
        {playerError && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="#121111ff"
            backdropFilter="blur(16px)"
            zIndex={100}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
          >
            <Box
              bg="#181818"
              borderRadius="xl"
              p={8}
              maxW="400px"
              mx={4}
              textAlign="center"
              boxShadow="2xl"
            >
              <Center
                w={16}
                h={16}
                bg="whiteAlpha.100"
                borderRadius="full"
                mx="auto"
                mb={5}
              >
                <FaLock size={28} color="#b3b3b3" />
              </Center>
              <Text fontSize="xl" fontWeight="bold" color="white" mb={3}>
                Compte Premium requis
              </Text>
              <Text color="#b3b3b3" fontSize="sm">
                Le Blind Test nécessite un abonnement Spotify Premium pour lire les morceaux.
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderPlaying = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const progressPercentage = (timeLeft / TIME_PER_QUESTION) * 100;

    return (
      <Box>
        <HStack justify="space-between" mb={8}>
          <Button
            onClick={resetGame}
            bg="transparent"
            color="#b3b3b3"
            p={2}
            _hover={{ color: 'white' }}
          >
            <FaTimes size={24} />
          </Button>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {selectedPlaylist?.name}
          </Text>

          {/* Stepper avec barre de progression */}
          <VStack gap={1} align="flex-end">
            <Text fontWeight="bold" color="white" fontSize="sm">
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
            <Box
              w="80px"
              h="15px"
              bg="whiteAlpha.300"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={`${((currentQuestionIndex + 1) / questions.length) * 100}%`}
                bg="white"
                transition="width 0.3s ease"
              />
            </Box>
          </VStack>
        </HStack>

        <Center flexDirection="column" mb={8}>
          {/* Circular timer */}
          <Box position="relative" w="180px" h="180px" mb={4}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="#333"
                strokeWidth="8"
              />
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="#1db954"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - progressPercentage / 100)}`}
                transform="rotate(-90 90 90)"
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <Center position="absolute" top={0} left={0} right={0} bottom={0}>
              <Text fontSize="7xl" fontWeight="bold" color="white">
                {timeLeft}
              </Text>
            </Center>
          </Box>

          {/* Score display */}
          <Box
            bg="#121212"
            border="2px solid"
            borderColor="#b3b3b3"
            borderRadius="full"
            px={6}
            py={2}
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
              {score}pt{score !== 1 && 's'}
            </Text>
          </Box>
        </Center>

        {/* Answer choices */}
        <VStack gap={3} maxW="500px" mx="auto">
          {currentQuestion.choices.map(track => (
            <Button
              key={track.id}
              onClick={() => handleAnswer(track)}
              disabled={answered}
              w="100%"
              py={6}
              bg="whiteAlpha.100"
              color="white"
              border="1px solid"
              borderColor={
                answered && track.id === currentQuestion.correctTrack.id
                  ? 'spotify.green'
                  : 'transparent'
              }
              borderRadius="lg"
              _hover={{ bg: 'whiteAlpha.200' }}
              _disabled={{ cursor: 'default' }}
            >
              {track.name}
            </Button>
          ))}
        </VStack>
      </Box>
    );
  };

  const renderResults = () => (
    <Box>
      {/* Score header */}
      <Flex
        bg="#1db954"
        borderRadius="lg"
        p={4}
        mb={8}
        justify="space-between"
        align="center"
      >
        <Box
          bg="#121212"
          borderRadius="md"
          px={4}
          py={2}
        >
          <Text fontSize="xl" fontWeight="bold" color="white">
            {score}pts
          </Text>
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="#121212">
          {selectedPlaylist?.name}
        </Text>
      </Flex>

      <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
        Morceaux joués
      </Text>

      <VStack gap={3} align="stretch" mb={8}>
        {playedTracks.map(({ track, wasCorrect }, index) => (
          <HStack
            key={`${track.id}-${index}`}
            bg={wasCorrect ? 'rgba(29, 185, 84, 0.2)' : 'whiteAlpha.50'}
            borderRadius="lg"
            p={3}
            gap={4}
          >
            <Image
              src={track.album.images[0]?.url}
              alt={track.name}
              w="50px"
              h="50px"
              borderRadius="md"
              objectFit="cover"
            />
            <Box flex={1}>
              <Text color="white" fontWeight="medium">
                {track.name}
              </Text>
              <Text color="#b3b3b3" fontSize="sm">
                {track.artists.map(a => a.name).join(', ')}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>

      <Center>
        <Button
          onClick={resetGame}
          bg="white"
          color="black"
          borderRadius="full"
          px={6}
          py={5}
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ bg: 'gray.100' }}
        >
          <FaPlay style={{ marginRight: 10 }} size={12} />
          Rejouer
        </Button>
      </Center>
    </Box>
  );

  return (
    <Box
      p={8}
      height="100%"
      position="relative"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {gameState === 'setup' && renderSetup()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'results' && renderResults()}
    </Box>
  );
}