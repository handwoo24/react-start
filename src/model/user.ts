import { z } from "zod";

export const zodAccountSchema = z.object({
  id: z.string().uuid(),
  uid: z.string(),
  provider: z.string().max(255),
  provider_account_id: z.string().max(255),
});

export type Account = z.infer<typeof zodAccountSchema>;

export const zodUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  email: z.string().max(255),
  email_verified: z.boolean().nullish(),
  picture: z.string().nullish(),
  disabled: z.boolean(),
});

export type User = z.infer<typeof zodUserSchema>;
