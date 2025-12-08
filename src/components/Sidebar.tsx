import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Box, Flex, Text, Image, Button, Icon, VStack, Badge } from '@chakra-ui/react';
import { FaMusic, FaChartBar, FaGamepad, FaListUl, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../services/spotifyAuth';
import type { SpotifyUser } from '../services/spotifyApi';

interface SidebarProps {
    user: SpotifyUser | null;
}

export function Sidebar({ user }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate({ to: '/' });
    };

    const navItems = [
        { path: '/dashboard/stats', icon: FaChartBar, label: 'Statistiques' },
        { path: '/dashboard/blindtest', icon: FaGamepad, label: 'Blind Test' },
        { path: '/dashboard/playlist-gen', icon: FaListUl, label: 'Générateur\nde Playlists' },
    ];

    return (
        <Box
            as="aside"
            w="240px"
            minH="100vh"
            bg="spotify.dark"
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
            display="flex"
            flexDirection="column"
            p={5}
            position="fixed"
            left={0}
            top={0}
        >
            {/* Logo */}
            <Flex align="center" gap={3} mb={6}>
                <Flex
                    align="center"
                    justify="center"
                    bg="spotify.green"
                    borderRadius="lg"
                    w="40px"
                    h="40px"
                >
                    <Icon as={FaMusic} boxSize={5} color="white" />
                </Flex>
                <Text color="white" fontSize="xl" fontWeight="bold">SpotyFusion</Text>
            </Flex>

            {/* User Profile */}
            {user && (
                <Flex
                    align="center"
                    gap={3}
                    p={3}
                    bg="whiteAlpha.50"
                    borderRadius="lg"
                    mb={6}
                >
                    <Image
                        src={user.images?.[0]?.url || '/default-avatar.png'}
                        alt={user.display_name}
                        boxSize="42px"
                        borderRadius="full"
                        objectFit="cover"
                        border="2px solid"
                        borderColor="spotify.green"
                    />
                    <VStack align="start" gap={0.5}>
                        <Text fontSize="sm" fontWeight="semibold" color="spotify.white">
                            {user.display_name}
                        </Text>
                        {user.product === 'premium' && (
                            <Badge
                                bg="spotify.green"
                                color="spotify.black"
                                fontSize="0.6rem"
                                fontWeight="bold"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                            >
                                Premium
                            </Badge>
                        )}
                    </VStack>
                </Flex>
            )}

            {/* Navigation */}
            <VStack as="nav" gap={1} flex={1} align="stretch">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                            <Flex
                                align="center"
                                gap={3}
                                px={4}
                                py={3}
                                color={isActive ? 'spotify.white' : 'spotify.lightGray'}
                                bg="transparent"
                                borderRadius="md"
                                fontSize="sm"
                                fontWeight="medium"
                                cursor="pointer"
                                transition="all 0.2s"
                                position="relative"
                                _before={isActive ? {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '60%',
                                    bg: 'spotify.green',
                                    borderRadius: 'full',
                                } : {}}
                                _hover={{
                                    color: 'spotify.white',
                                }}
                            >
                                <Icon
                                    as={item.icon}
                                    boxSize={5}
                                    color={isActive ? 'spotify.green' : 'inherit'}
                                />
                                <Text whiteSpace="pre-line">{item.label}</Text>
                            </Flex>
                        </Link>
                    );
                })}
            </VStack>

            {/* Logout Button */}
            <Button
                variant="ghost"
                justifyContent="flex-start"
                gap={3}
                px={4}
                py={3}
                h="auto"
                color="red.400"
                fontSize="sm"
                fontWeight="normal"
                borderRadius="md"
                onClick={handleLogout}
                _hover={{
                    bg: 'whiteAlpha.100',
                }}
            >
                <Icon as={FaSignOutAlt} boxSize={5} color="red.400" />
                <Text>Déconnexion</Text>
            </Button>
        </Box>
    );
}

