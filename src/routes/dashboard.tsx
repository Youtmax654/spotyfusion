import Header from "@/components/sidebar/Header";
import LogoutButton from "@/components/sidebar/LogoutButton";
import NavItems from "@/components/sidebar/NavItems";
import ProfileCard from "@/components/sidebar/ProfileCard";
import { toaster } from "@/components/ui/toaster";
import MenuIcon from "@/icons/MenuIcon";
import MusicNoteIcon from "@/icons/MusicNoteIcon";
import PlaylistIcon from "@/icons/PlaylistIcon";
import StatsIcon from "@/icons/StatsIcon";
import { getUserProfile } from "@/services/spotify.service";
import {
  Center,
  Drawer,
  Flex,
  HStack,
  Icon,
  IconButton,
  Separator,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  pendingComponent: () => (
    <Center h="100vh" bg="black">
      <Spinner size="xl" color="green.500" borderWidth="4px" />
    </Center>
  ),
  staleTime: Infinity,
  loader: async () => {
    try {
      const user = await getUserProfile();
      return { user };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toaster.create({
        title: "Erreur de connexion",
        description:
          "Une erreur est survenue lors de la récupération de votre profil.",
        type: "error",
      });
      throw redirect({
        to: "/",
      });
    }
  },
});

const routes = [
  {
    path: "/dashboard/stats",
    label: "Statistiques",
    icon: StatsIcon,
  },
  {
    path: "/dashboard/blindtest",
    label: "Blind Test",
    icon: MusicNoteIcon,
  },
  {
    path: "/dashboard/playlist-gen",
    label: "Générateur de Playlists",
    icon: PlaylistIcon,
  },
];

// Sidebar content component (shared between desktop and mobile drawer)
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    if (onClose) onClose();
    navigate({ to: path });
  };

  return (
    <>
      <Header />
      <Separator />
      <ProfileCard />
      <Separator />
      <VStack as="nav" flex={1} justifyContent="space-between">
        <VStack as="ul" listStyleType="none" width="100%" flex={1}>
          {routes.map((route) => (
            <div key={route.path} onClick={() => handleNavClick(route.path)} style={{ width: "100%" }}>
              <NavItems
                path={route.path}
                label={route.label}
                icon={route.icon}
              />
            </div>
          ))}
        </VStack>
        <Stack width="100%" gap={4}>
          <Separator />
          <LogoutButton />
        </Stack>
      </VStack>
    </>
  );
}

// Dashboard layout with sidebar
function RouteComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Stack height="100vh" bg="spotify.dark" gap={0}>
      {/* Mobile Header - visible only on mobile */}
      <Flex
        display={{ base: "flex", md: "none" }}
        as="header"
        alignItems="center"
        gap={2}
        px={4}
        py={3}
        bg="spotify.panel"
        borderBottomWidth="1px"
        borderColor="spotify.border"
      >
        <IconButton
          aria-label="Ouvrir le menu"
          variant="ghost"
          onClick={() => setDrawerOpen(true)}
          size="md"
        >
          <Icon as={MenuIcon} boxSize={6} />
        </IconButton>
        <Text fontSize="lg" fontWeight="semibold">
          Menu
        </Text>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="spotify.panel" maxWidth="280px">
            <Drawer.Body padding={6} display="flex" flexDirection="column" gap={4}>
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      {/* Main content area */}
      <HStack flex={1} alignItems="start" padding={2} gap={2} overflow="hidden">
        {/* Desktop Sidebar - hidden on mobile */}
        <Stack
          as="aside"
          display={{ base: "none", md: "flex" }}
          width="280px"
          gap={4}
          padding={6}
          borderRadius="8px"
          height="calc(100vh - 16px)"
          bg="spotify.panel"
          flexShrink={0}
        >
          <SidebarContent />
        </Stack>

        {/* Main content */}
        <Stack
          as="main"
          bg="spotify.panel"
          flex={1}
          borderRadius="8px"
          height={{ base: "calc(100vh - 72px)", md: "calc(100vh - 16px)" }}
          overflow="auto"
        >
          <Outlet />
        </Stack>
      </HStack>
    </Stack>
  );
}
