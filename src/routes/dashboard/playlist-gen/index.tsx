import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/playlist-gen/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/playlist-gen/"!</div>;
}
