import { z } from "zod";

// Schema for time slots
const timeSlotSchema = z.object({
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  isAvailable: z.boolean().default(true),
});

// Schema for daily schedule
const dailyScheduleSchema = z
  .object({
    dayOfWeek: z.number().min(0).max(6),
    isWorkingDay: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  })
  .superRefine((data, ctx) => {
    if (data.isWorkingDay && data.timeSlots.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Working days must have at least one time slot",
        path: ["timeSlots"],
      });
    }
    if (!data.isWorkingDay && data.timeSlots.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-working days must have no time slots",
        path: ["timeSlots"],
      });
    }
  });

// Schema for unavailable dates
const unavailableDateSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  reason: z.string().optional(),
});

// Schema for creating availability
export const createAvailabilitySchema = z.object({
  body: z.object({
    weeklySchedule: z
      .array(dailyScheduleSchema)
      .min(1, "At least one day must be scheduled")
      .refine((schedule) => {
        const days = new Set(schedule.map((s) => s.dayOfWeek));
        return days.size === schedule.length;
      }, "Duplicate days are not allowed"),
    unavailableDates: z.array(unavailableDateSchema).optional(),
    slotDuration: z.number().min(15).max(120).optional(),
    timezone: z.string(),
  }),
});

// Schema for updating availability
export const updateAvailabilitySchema = z.object({
  body: z.object({
    weeklySchedule: z
      .array(dailyScheduleSchema)
      .min(1, "At least one day must be scheduled")
      .refine((schedule) => {
        const days = new Set(schedule.map((s) => s.dayOfWeek));
        return days.size === schedule.length;
      }, "Duplicate days are not allowed")
      .optional(),
    unavailableDates: z.array(unavailableDateSchema).optional(),
    slotDuration: z.number().min(15).max(120).optional(),
    timezone: z.string().optional(),
  }),
});
