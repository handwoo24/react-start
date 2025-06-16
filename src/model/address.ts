import { z } from "zod";

export const addressSchema = z.object({
  id: z.string(),
  roadAddress: z.string(),
  jibunAddress: z.string(),
  englishAddress: z.string(),
  addressElements: z
    .object({
      type: z.string().array(),
      loadName: z.string(),
      shortName: z.string(),
      code: z.string(),
    })
    .array(),
  x: z.string(),
  y: z.string(),
  distance: z.number(),
});

export type Address = z.infer<typeof addressSchema>;
