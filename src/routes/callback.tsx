import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { handleSpotifyCallback } from '../services/spotifyAuth'

export const Route = createFileRoute('/callback')({
    component: CallbackPage,
})

function CallbackPage() {
    const navigate = useNavigate()

    const processedRef = useRef(false)

    useEffect(() => {
        const processCallback = async () => {
            if (processedRef.current) return
            processedRef.current = true

            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')
            const error = urlParams.get('error')

            if (error) {
                console.error('Authorization error:', error)
                navigate({ to: '/' })
                return
            }

            if (code) {
                const success = await handleSpotifyCallback(code)
                if (success) {
                    navigate({ to: '/dashboard/stats' })
                } else {
                    navigate({ to: '/' })
                }
            } else {
                navigate({ to: '/' })
            }
        }

        processCallback()
    }, [navigate])

    return (
        <Center
            minH="100vh"
            bgGradient="linear(180deg, spotify.gray 0%, spotify.dark 100%)"
        >
            <VStack gap={6} textAlign="center">
                <Spinner
                    size="xl"
                    color="spotify.green"
                    borderWidth="4px"
                    css={{
                        '--spinner-track-color': 'rgba(29, 185, 84, 0.2)',
                    }}
                />
                <Box>
                    <Text fontSize="xl" fontWeight="semibold" color="spotify.white" mb={2}>
                        Connexion en cours...
                    </Text>
                    <Text color="spotify.lightGray">
                        Veuillez patienter pendant que nous vous connectons à Spotify
                    </Text>
                </Box>
            </VStack>
        </Center>
    )
}
