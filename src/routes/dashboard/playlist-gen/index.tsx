import { createFileRoute } from '@tanstack/react-router';
import { Box, Text, VStack, Icon, Center } from '@chakra-ui/react';
import { FaListUl } from 'react-icons/fa';

export const Route = createFileRoute('/dashboard/playlist-gen/')({
  component: PlaylistGenPage,
});

function PlaylistGenPage() {
  return (
    <Box p={8}>
      <Text fontSize="2xl" fontWeight="bold" color="spotify.white" mb={8}>
        Générateur de Playlists
      </Text>

      <Center py={20}>
        <VStack
          gap={6}
          p={12}
          bg="whiteAlpha.50"
          borderRadius="2xl"
          border="1px dashed"
          borderColor="spotify.green"
          textAlign="center"
        >
          <Icon as={FaListUl} boxSize={16} color="spotify.green" />
          <Text fontSize="xl" fontWeight="bold" color="spotify.white">
            🎧 Générateur de Playlists Intelligent
          </Text>
          <Text color="spotify.lightGray" maxW="400px">
            Créez des playlists personnalisées basées sur l'énergie, la danceability
            et vos artistes préférés. Cette fonctionnalité arrive bientôt !
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}
