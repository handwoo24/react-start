import { z } from "zod";

export enum AttendanceEventType {
  checkIn,
  checkOut,
}

export const attendanceEventSchema = z.object({
  uid: z.string(),
  id: z.string(),
  x: z.string(),
  y: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  type: z.nativeEnum(AttendanceEventType),
  notes: z.string().optional(),
  timestamp: z.number(),
});

export type AttendanceEvent = z.infer<typeof attendanceEventSchema>;
