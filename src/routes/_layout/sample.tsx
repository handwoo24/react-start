import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/sample")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_layout/sample"!</div>;
}
