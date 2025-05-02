import mongoose, { Schema } from "mongoose";
import { IBookingDocument } from "../interfaces/booking.repository.interface";

const bookingSchema = new Schema<IBookingDocument>(
  {
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    date: { type: Date, required: true },
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
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled", "no-show"],
      default: "upcoming",
    },
    reason: { type: String },
    notes: { type: String },
    timezone: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt timestamp before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const BookingModel = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema
);
