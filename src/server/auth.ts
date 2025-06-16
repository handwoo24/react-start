import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { generateAuthUrl, getOAuthClient } from "~/auth/google";
import { useAuthSession } from "~/auth/session";

export const loginFn = createServerFn({ method: "GET" }).handler(async () => {
  const oauthClient = getOAuthClient();
  const href = await generateAuthUrl(oauthClient);

  throw redirect({ href });
});

export const logoutFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAuthSession();
  session.clear();

  throw redirect({ to: "/auth/login" });
});
