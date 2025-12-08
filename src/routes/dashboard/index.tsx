import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, Flex, Text, Button, Image, VStack, Center, Spinner } from "@chakra-ui/react";
import { getAccessToken, logout } from "../../services/spotifyAuth";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

interface SpotifyUser {
  display_name: string;
  email: string;
  images: { url: string }[];
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAccessToken();

      if (!token) {
        navigate({ to: "/" });
        return;
      }

      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        logout();
        navigate({ to: "/" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <Center minH="100vh" bgGradient="linear(180deg, spotify.gray 0%, spotify.dark 100%)">
        <VStack gap={4}>
          <Spinner size="xl" color="spotify.green" />
          <Text color="spotify.lightGray">Chargement...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="spotify.dark" p={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <Text fontSize="2xl" fontWeight="bold" color="spotify.white">
          Bienvenue, {user?.display_name} 👋
        </Text>
        <Button
          size="sm"
          bg="transparent"
          color="spotify.lightGray"
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="full"
          onClick={handleLogout}
          _hover={{ bg: 'whiteAlpha.100', color: 'red.400' }}
        >
          Déconnexion
        </Button>
      </Flex>

      <Flex
        align="center"
        gap={6}
        p={6}
        bg="whiteAlpha.50"
        borderRadius="xl"
        mb={6}
      >
        {user?.images?.[0] && (
          <Image
            src={user.images[0].url}
            alt="Profile"
            boxSize="80px"
            borderRadius="full"
            objectFit="cover"
          />
        )}
        <VStack align="start" gap={1}>
          <Text fontSize="xl" fontWeight="bold" color="spotify.white">
            {user?.display_name}
          </Text>
          <Text color="spotify.lightGray">{user?.email}</Text>
        </VStack>
      </Flex>

      <Box
        textAlign="center"
        p={8}
        bg="rgba(29, 185, 84, 0.1)"
        borderRadius="xl"
        border="1px dashed"
        borderColor="spotify.green"
      >
        <Text fontSize="lg" color="spotify.lightGray">
          🚀 Vos statistiques et playlists arrivent bientôt !
        </Text>
      </Box>
    </Box>
  );
}
