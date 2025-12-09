import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Box, Text, Button, Image, Center } from '@chakra-ui/react'
import { loginWithSpotify, isAuthenticated } from '../services/spotifyAuth'
import albumCoversImage from '../assets/albumcovers.png'
import logoIcon from '../assets/Icon.svg'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: '/dashboard/stats' })
    }
  }, [navigate])

  const handleLogin = async () => {
    await loginWithSpotify()
  }

  return (
    <Box minH="100vh" position="relative" overflow="hidden" display="flex" alignItems="center" justifyContent="center" bg="spotify.dark">
      {/* Green radial gradient overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="radial-gradient(ellipse at 0% 0%, #1db954 0%, rgba(29, 185, 84, 0.6) 20%, rgba(13, 74, 40, 0.4) 40%, transparent 70%)"
        zIndex={0}
      />
      {/* Secondary green glow */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="radial-gradient(ellipse at 20% 30%, rgba(29, 185, 84, 0.3) 0%, transparent 50%)"
        zIndex={0}
      />

      {/* Album covers image */}
      <Image
        src={albumCoversImage}
        alt="Album covers collage"
        position="absolute"
        top="0%"
        right="0%"
        maxW="1000px"
        zIndex={1}
        opacity={0.9}
        display={{ base: 'none', lg: 'block' }}
      />

      {/* Login card */}
      <Box
        position="relative"
        zIndex={10}
        bg="rgba(18, 18, 18, 0.95)"
        backdropFilter="blur(20px)"
        borderRadius="xl"
        p={10}
        maxW="400px"
        w="90%"
        textAlign="center"
        boxShadow="0 8px 40px rgba(0, 0, 0, 0.6)"
      >
        <Center
          w="70px"
          h="70px"
          borderRadius="full"
          mx="auto"
          mb={6}
          overflow="hidden"
        >
          <Image src={logoIcon} alt="SpotyFusion Logo" w="80%" h="80%" objectFit="cover" />
        </Center>

        <Text fontSize="2xl" fontWeight="bold" color="spotify.white" mb={4} letterSpacing="-0.02em">
          SpotyFusion
        </Text>

        <Text color="spotify.lightGray" fontSize="sm" lineHeight="tall" mb={8}>
          Enrichissez votre expérience Spotify avec des statistiques détaillées, des blind tests et un générateur de playlists intelligent
        </Text>

        <Button
          w="100%"
          py={6}
          fontSize="md"
          fontWeight="bold"
          color="spotify.black"
          bg="spotify.green"
          borderRadius="full"
          boxShadow="0 4px 15px rgba(29, 185, 84, 0.3)"
          onClick={handleLogin}
          _hover={{
            bg: 'spotify.greenDark',
            transform: 'scale(1.02)',
            boxShadow: '0 6px 25px rgba(29, 185, 84, 0.4)',
          }}
          _active={{
            transform: 'scale(0.98)',
          }}
        >
          Se Connecter avec Spotify
        </Button>

        <Text mt={6} fontSize="xs" color="spotify.lightGray" opacity={0.6}>
          Vous serez redirigé vers Spotify pour autoriser l'accès
        </Text>
      </Box>
    </Box>
  )
}
