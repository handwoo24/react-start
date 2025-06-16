import { z } from "zod";

export const zodAccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  provider: z.string().max(255),
  providerAccountId: z.string().max(255),
});

export type Account = z.infer<typeof zodAccountSchema>;
