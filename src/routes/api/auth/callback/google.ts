import { redirect } from "@tanstack/react-router";
import { createServerFileRoute } from "@tanstack/react-start/server";
import dayjs from "dayjs";
import { getOAuthClient, verifyTokens } from "~/auth/google";
import { useAuthSession } from "~/auth/session";
import { getAccountByGoogle } from "~/database/account";
import { createUserByGoogle, getUser } from "~/database/user";

export const ServerRoute = createServerFileRoute(
  "/api/auth/callback/google"
).methods({
  GET: async (request) => {
    const url = new URL(request.request.url);
    const code = url.searchParams.get("code");

    if (typeof code !== "string") {
      return new Response("Invalid code", { status: 400 });
    }

    const oauthClient = getOAuthClient();

    const { tokens } = await oauthClient.getToken(code);

    const payload = await verifyTokens(oauthClient, tokens);

    const idToken = payload.getPayload();
    if (!idToken) {
      throw new Error("Invalid ID Token");
    }

    const session = await useAuthSession();
    const token = crypto.randomUUID();
    const expires = dayjs().add(14, "day").valueOf();

    let account = await getAccountByGoogle(idToken.sub);
    if (account) {
      const user = await getUser(account.userId);
      if (!user) {
        return new Response("Not found user", { status: 400 });
      }

      await session.update({ token, user, expires });
    } else {
      const user = await createUserByGoogle(idToken);

      await session.update({ token, user, expires });
    }

    throw redirect({ to: "/" });
  },
});
