import mongoose, { Schema } from "mongoose";
import {
  IDoctorAvailabilityDocument,
  ITimeSlot,
  IDailySchedule,
  IUnavailableDate,
} from "../interfaces/availability.repository.interface";

// Schema for a single time slot
const TimeSlotSchema = new Schema<ITimeSlot>({
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid time format (HH:MM)`,
    },
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid time format (HH:MM)`,
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

// Schema for daily schedule
const DailyScheduleSchema = new Schema<IDailySchedule>({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6, // 0 = Sunday, 6 = Saturday
  },
  isWorkingDay: {
    type: Boolean,
    default: true,
  },
  timeSlots: [TimeSlotSchema],
});

// Schema for unavailable date
const UnavailableDateSchema = new Schema<IUnavailableDate>({
  date: {
    type: Date,
    required: true,
  },
  reason: String,
});

// Main availability schema
const DoctorAvailabilitySchema = new Schema<IDoctorAvailabilityDocument>({
  doctorId: {
    type: String,
    required: true,
  },
  weeklySchedule: [DailyScheduleSchema],
  unavailableDates: [UnavailableDateSchema],
  slotDuration: {
    type: Number,
    default: 30, // Default 30 minutes
    min: 15,
    max: 120,
  },
  timezone: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string): boolean {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch {
          return false;
        }
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid timezone`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
DoctorAvailabilitySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const DoctorAvailabilityModel =
  mongoose.model<IDoctorAvailabilityDocument>(
    "DoctorAvailability",
    DoctorAvailabilitySchema
  );
