import { Box, Text, VStack, HStack, Button, Center } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import type { SpotifyTrack } from '../../services/spotify.service';

interface GameQuestion {
  correctTrack: SpotifyTrack;
  choices: SpotifyTrack[];
}

interface QuizGameProps {
  playlistName: string;
  questions: GameQuestion[];
  currentQuestionIndex: number;
  score: number;
  timeLeft: number;
  timePerQuestion: number;
  answered: boolean;
  selectedAnswer: SpotifyTrack | null;
  onAnswer: (track: SpotifyTrack) => void;
  onReset: () => void;
}

export default function QuizGame({
  playlistName,
  questions,
  currentQuestionIndex,
  score,
  timeLeft,
  timePerQuestion,
  answered,
  selectedAnswer,
  onAnswer,
  onReset,
}: QuizGameProps) {
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progressPercentage = (timeLeft / timePerQuestion) * 100;

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Button
          onClick={onReset}
          bg="transparent"
          color="#b3b3b3"
          p={2}
          _hover={{ color: 'white' }}
        >
          <FaTimes size={24} />
        </Button>
        <Text fontSize="xl" fontWeight="bold" color="white">
          {playlistName}
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
        {currentQuestion.choices.map(track => {
          const isCorrect = track.id === currentQuestion.correctTrack.id;
          const isSelected = selectedAnswer?.id === track.id;

          let bgColor = 'whiteAlpha.100';
          let borderColor = 'transparent';

          if (answered) {
            if (isCorrect) {
              bgColor = 'rgba(29, 185, 84, 0.4)';
              borderColor = '#1db954';
            } else if (isSelected) {
              bgColor = 'rgba(239, 68, 68, 0.4)';
              borderColor = '#ef4444';
            }
          }

          return (
            <Button
              key={track.id}
              onClick={() => onAnswer(track)}
              disabled={answered}
              w="100%"
              py={6}
              bg={bgColor}
              color="white"
              border="2px solid"
              borderColor={borderColor}
              borderRadius="lg"
              _hover={{ bg: answered ? bgColor : 'whiteAlpha.200' }}
              _disabled={{ cursor: 'default', opacity: isCorrect ? 1 : 0.5 }}
              transition="all 0.3s ease"
            >
              {track.name}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
}
