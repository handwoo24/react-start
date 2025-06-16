import { z } from "zod";

export const zodUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255).optional(),
  email: z.string().max(255).optional(),
  emailVerified: z.boolean().optional(),
  picture: z.string().optional(),
  disabled: z.boolean().optional(),
  admin: z.boolean().optional(),
});

export type User = z.infer<typeof zodUserSchema>;
