import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { SpotifyPlayerProvider } from "../hooks/useSpotifyPlayer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <SpotifyPlayerProvider>
        <Outlet />
      </SpotifyPlayerProvider>
    </React.Fragment>
  );
}
