import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { UserProvider } from "~/components/UserProvider";
import { getSessionFn } from "~/server/auth";
import { getUserFn } from "~/server/user";

export const Route = createFileRoute("/_private")({
  component: RouteComponent,
  async loader() {
    const session = await getSessionFn();

    if (!session.uid) {
      throw redirect({ to: "/auth/login" });
    }

    const user = await getUserFn({ data: session.uid });
    return { user };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <UserProvider user={user}>
      <Outlet />
    </UserProvider>
  );
}
