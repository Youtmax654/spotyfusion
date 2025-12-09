import Header from "@/components/sidebar/Header";
import LogoutButton from "@/components/sidebar/LogoutButton";
import NavItems from "@/components/sidebar/NavItems";
import ProfileCard from "@/components/sidebar/ProfileCard";
import { toaster } from "@/components/ui/toaster";
import MusicNoteIcon from "@/icons/MusicNoteIcon";
import PlaylistIcon from "@/icons/PlaylistIcon";
import StatsIcon from "@/icons/StatsIcon";
import { spotifyService } from "@/services/spotify.service";
import { HStack, Separator, Stack, VStack } from "@chakra-ui/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  staleTime: Infinity,
  loader: async () => {
    try {
      const user = await spotifyService.getUserProfile();
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

// Dashboard layout with sidebar
function RouteComponent() {
  return (
    <HStack height="100vh" alignItems="start" padding={2} bg="spotify.dark">
      <Stack
        as="aside"
        width="280px"
        gap={4}
        padding={6}
        borderRadius="8px"
        height="calc(100vh - 16px)"
        bg="spotify.panel"
      >
        <Header />

        <Separator />

        <ProfileCard />

        <Separator />

        <VStack as="nav" flex={1} justifyContent="space-between">
          <VStack as="ul" listStyleType="none" width="100%" flex={1}>
            {routes.map((route) => (
              <NavItems
                key={route.path}
                path={route.path}
                label={route.label}
                icon={route.icon}
              />
            ))}
          </VStack>

          <Stack width="100%" gap={4}>
            <Separator />

            <LogoutButton />
          </Stack>
        </VStack>
      </Stack>

      <Stack
        as="main"
        bg="spotify.panel"
        flex={1}
        borderRadius="8px"
        height="calc(100vh - 16px)"
        width="calc(100% - 296px)"
      >
        <Outlet />
      </Stack>
    </HStack>
  );
}
