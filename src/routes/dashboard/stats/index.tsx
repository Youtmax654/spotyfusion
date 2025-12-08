import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/stats/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/stats/"!</div>;
}
