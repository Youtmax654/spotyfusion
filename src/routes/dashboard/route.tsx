import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Box, Flex, VStack, Center, Spinner, Text } from '@chakra-ui/react';
import { Sidebar } from '../../components/Sidebar';
import { getCurrentUser, type SpotifyUser } from '../../services/spotifyApi';
import { isAuthenticated } from '../../services/spotifyAuth';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/' });
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate({ to: '/' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <Flex minH="100vh" bg="spotify.dark">
        <Sidebar user={null} />
        <Center flex={1} ml="240px">
          <VStack gap={4}>
            <Spinner size="xl" color="spotify.green" />
            <Text color="spotify.lightGray">Chargement...</Text>
          </VStack>
        </Center>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="spotify.dark" overflow="hidden">
      {/* Sidebar persistante - ne se recharge plus */}
      <Sidebar user={user} />

      {/* Contenu principal - seule cette partie change entre les pages */}
      <Box
        as="main"
        flex={1}
        ml="240px"
        maxW="calc(100vw - 240px)"
        overflowX="hidden"
        bgGradient="linear(180deg, #1a1a2e 0%, spotify.dark 300px)"
      >
        <Outlet />
      </Box>
    </Flex>
  );
}
