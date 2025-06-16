import { z } from "zod";

export const geolocationPositionSchema = z.object({
  timestamp: z.number(),
  coords: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
    altitude: z.number().nullable(),
    altitudeAccuracy: z.number().nullable(),
    heading: z.number().nullable(),
    speed: z.number().nullable(),
  }),
});

export type GeolocationPosition = z.infer<typeof geolocationPositionSchema>;

export const userAgentSchema = z.object({
  ua: z.string(),
  browser: z.object({
    name: z.string().optional(),
    version: z.string().optional(),
    major: z.string().optional(),
  }),
  engine: z.object({
    name: z.string().optional(),
    version: z.string().optional(),
  }),
  os: z.object({
    name: z.string().optional(),
    version: z.string().optional(),
  }),
  device: z.object({
    vendor: z.string().optional(),
    model: z.string().optional(),
    type: z.string().optional(),
  }),
  cpu: z.object({
    architecture: z.string().optional(),
  }),
  isBot: z.boolean(),
});

export type UserAgent = z.infer<typeof userAgentSchema>;

export enum AttendanceEventType {
  checkIn,
  checkOut,
}

export const attendanceEventSchema = z.object({
  userId: z.string(),
  id: z.string(),
  geolocationPosition: geolocationPositionSchema.optional(),
  userAgent: userAgentSchema,
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  type: z.nativeEnum(AttendanceEventType),
  notes: z.string().optional(),
  timestamp: z.number(),
});

export type AttendanceEvent = z.infer<typeof attendanceEventSchema>;
