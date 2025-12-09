import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/dashboard/stats" search={{ range: "short_term" }} />;
}
