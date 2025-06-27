import { useSession } from "@tanstack/react-start/server";

type Session = {
  token?: string;
  expires?: number;
  uid?: string;
};

const AUTH_SECRET = process.env.AUTH_SECRET;

export function useAuthSession() {
  if (typeof AUTH_SECRET !== "string") {
    throw new Error("Missing AUTH_SECRET");
  }

  return useSession<Session>({ password: AUTH_SECRET });
}
