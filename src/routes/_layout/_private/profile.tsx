import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "~/components/UserProvider";

export const Route = createFileRoute("/_layout/_private/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();

  return <div>Hello {user?.name}!</div>;
}
