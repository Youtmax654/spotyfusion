import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useSpotifyPlayer } from "../../../hooks/useSpotifyPlayer";
import PlaylistSelector from "../../../components/blindtest/PlaylistSelector";
import QuizGame from "../../../components/blindtest/QuizGame";
import Results from "../../../components/blindtest/Results";
import type { SpotifyPlaylist, SpotifyTrack } from "@/schemas/Spotify";
import { getPlaylistTracks, getUserPlaylists } from "@/services/spotify.service";

export const Route = createFileRoute("/dashboard/blindtest/")({
  loader: async () => {
    const playlistsData = await getUserPlaylists();
    // Filtrer les playlists qui ont au moins 10 morceaux
    const playlists = playlistsData.filter((p) => p.tracks.total >= 10);
    return { playlists };
  },
  component: BlindTestPage,
});

type GameState = "setup" | "playing" | "results";

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
  // Récupérer les playlists depuis le loader
  const { playlists } = Route.useLoaderData();

  const [gameState, setGameState] = useState<GameState>("setup");
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(false);

  // Game state
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [playedTracks, setPlayedTracks] = useState<PlayedTrack[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<SpotifyTrack | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spotify Web Playback SDK
  const {
    isReady,
    error: playerError,
    play,
    pause,
    activatePlayer,
    reconnect,
  } = useSpotifyPlayer();

  // Auto-reconnect if player is not ready when page loads
  useEffect(() => {
    if (!isReady && !playerError) {
      console.log("🔄 BlindTest: Player not ready, attempting reconnect...");
      reconnect();
    }
  }, [isReady, playerError, reconnect]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing" || answered) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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
      alert(
        "Le lecteur Spotify n'est pas prêt. Assurez-vous d'avoir un compte Premium et que le SDK est chargé."
      );
      return;
    }

    // Activate player element (needed for browsers)
    await activatePlayer();

    setLoading(true);

    try {
      const tracks = await getPlaylistTracks(
        selectedPlaylist.id
      );
      if (tracks.length < 4) {
        alert("Cette playlist n'a pas assez de morceaux.");
        setLoading(false);
        return;
      }

      const shuffledTracks = shuffleArray(tracks);
      const gameQuestions: GameQuestion[] = [];

      for (
        let i = 0;
        i < Math.min(QUESTIONS_PER_GAME, shuffledTracks.length);
        i++
      ) {
        const correctTrack = shuffledTracks[i];
        const wrongChoices = shuffleArray(
          shuffledTracks.filter((t) => t.id !== correctTrack.id)
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
      setGameState("playing");

      // Start playing the first track
      const trackUri = `spotify:track:${gameQuestions[0].correctTrack.id}`;
      const success = await play(trackUri);
      if (!success) {
        console.error("Failed to start first track");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Erreur lors du démarrage du jeu.");
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
      setScore((prev) => prev + 3 + timeBonus);
    }

    setPlayedTracks((prev) => [
      ...prev,
      {
        track: currentQuestion.correctTrack,
        wasCorrect: isCorrect,
      },
    ]);

    // Move to next question after a short delay
    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setAnswered(false);
        setSelectedAnswer(null);
        const nextQuestion = questions[currentQuestionIndex + 1];
        if (nextQuestion) {
          const trackUri = `spotify:track:${nextQuestion.correctTrack.id}`;
          await play(trackUri);
        }
      } else {
        await pause();
        setGameState("results");
      }
    }, 1500);
  };

  const handleAnswer = (selectedTrack: SpotifyTrack) => {
    if (answered) return;
    setSelectedAnswer(selectedTrack);
    processAnswer(selectedTrack);
  };

  const resetGame = async () => {
    await pause();
    setGameState("setup");
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

  return (
    <Box
      p={8}
      height="100%"
      position="relative"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {gameState === "setup" && (
        <PlaylistSelector
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={setSelectedPlaylist}
          onStartGame={startGame}
          loading={loading}
          isPlayerReady={isReady}
          playerError={!!playerError}
        />
      )}

      {gameState === "playing" && (
        <QuizGame
          playlistName={selectedPlaylist?.name || ""}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          score={score}
          timeLeft={timeLeft}
          timePerQuestion={TIME_PER_QUESTION}
          answered={answered}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          onReset={resetGame}
        />
      )}

      {gameState === "results" && (
        <Results
          score={score}
          playlistName={selectedPlaylist?.name || ""}
          playedTracks={playedTracks}
          onPlayAgain={resetGame}
        />
      )}
    </Box>
  );
}