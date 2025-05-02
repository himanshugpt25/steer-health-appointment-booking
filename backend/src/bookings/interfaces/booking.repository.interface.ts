import { Document } from "mongoose";

export type BookingStatus = "upcoming" | "completed" | "cancelled" | "no-show";

export interface IBooking {
  id: string;
  doctorId: string;
  patientId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  reason?: string;
  notes?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends Omit<IBooking, "id">, Document {}

export interface ICreateBooking {
  doctorId: string;
  patientId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  reason?: string;
  notes?: string;
  timezone: string;
}

export interface IBookingRepository {
  createBooking(data: ICreateBooking): Promise<IBooking>;
  getBookingById(id: string): Promise<IBooking | null>;
  getBookingsByDoctorId(doctorId: string): Promise<IBooking[]>;
  getBookingsByPatientId(patientId: string): Promise<IBooking[]>;
  getBookingsByDoctorIdAndDate(
    doctorId: string,
    date: Date
  ): Promise<IBooking[]>;
  updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<IBooking | null>;
  deleteBooking(id: string): Promise<boolean>;
}
