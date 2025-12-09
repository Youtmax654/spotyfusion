import ExitIcon from "@/icons/ExitIcon";
import { Button, Icon, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    await navigate({ to: "/" });
  };

  return (
    <Button
      as="li"
      width="100%"
      variant="ghost"
      gap={3}
      px={4}
      py={6}
      justifyContent="flex-start"
      color="red"
      onClick={handleLogout}
    >
      <Icon as={ExitIcon} boxSize={5} />
      <Text>Déconnexion</Text>
    </Button>
  );
}
