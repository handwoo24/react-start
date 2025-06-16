import { z } from "zod";

export const zodUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  email: z.string().max(255),
  emailVerified: z.boolean().optional(),
  picture: z.string().optional(),
  disabled: z.boolean(),
  admin: z.boolean(),
});

export type User = z.infer<typeof zodUserSchema>;
