import { useSession } from "@tanstack/react-start/server";
import { User } from "~/model/user";

type Session = {
  token: string;
  expires: number;
  user: User;
};

const AUTH_SECRET = process.env.AUTH_SECRET;

export function useAuthSession() {
  if (typeof AUTH_SECRET !== "string") {
    throw new Error("Missing AUTH_SECRET");
  }

  return useSession<Session>({ password: AUTH_SECRET });
}
