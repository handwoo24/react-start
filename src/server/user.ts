import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUser } from "~/database/user";

export const getUserFn = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler((ctx) => getUser(ctx.data));
