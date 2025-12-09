import { toaster } from "@/components/ui/toaster";
import { spotifyConfig } from "@/config/spotify";
import { Center, Spinner } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/callback")({
  component: RouteComponent,
});

const getToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  // stored in the previous step
  const codeVerifier = localStorage.getItem("code_verifier");

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: spotifyConfig.clientId,
      grant_type: "authorization_code",
      code: code || "",
      redirect_uri: spotifyConfig.redirectUri,
      code_verifier: codeVerifier || "",
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  if (response.error) {
    console.error("Error fetching token:", response.error);
    toaster.error({
      title: "Une erreur est survenue",
      description: "Veuillez réessayer plus tard.",
    });
    window.location.href = "/";
    return;
  }

  localStorage.removeItem("code_verifier");

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);

  window.location.href = "/dashboard";
};

function RouteComponent() {
  useEffect(() => {
    getToken();
  }, []);

  return (
    <Center h="100vh">
      <Spinner size="xl" color="green.500" borderWidth="4px" />
    </Center>
  );
}
