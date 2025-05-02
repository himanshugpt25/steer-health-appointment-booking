import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    date: z.string().transform((str: string) => new Date(str)),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)"
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)"
      ),
    reason: z.string().optional(),
    notes: z.string().optional(),
    timezone: z.string(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Booking ID is required"),
  }),
  body: z.object({
    status: z.enum(["upcoming", "completed", "cancelled", "no-show"], {
      errorMap: () => ({ message: "Invalid status" }),
    }),
  }),
});
