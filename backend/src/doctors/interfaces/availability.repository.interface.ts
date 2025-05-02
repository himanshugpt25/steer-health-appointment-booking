import { Document } from "mongoose";

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IDailySchedule {
  dayOfWeek: number;
  isWorkingDay: boolean;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  timeSlots: ITimeSlot[];
}

export interface IUnavailableDate {
  date: Date;
  reason?: string;
}

export interface IDoctorAvailability {
  id: string;
  doctorId: string;
  weeklySchedule: IDailySchedule[];
  unavailableDates: IUnavailableDate[];
  slotDuration: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document interface for Mongoose
export interface IDoctorAvailabilityDocument extends Document {
  doctorId: string;
  weeklySchedule: IDailySchedule[];
  unavailableDates: IUnavailableDate[];
  slotDuration: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateDoctorAvailability {
  doctorId: string;
  weeklySchedule: IDailySchedule[];
  unavailableDates?: IUnavailableDate[];
  slotDuration?: number;
  timezone: string;
}

export interface IAvailabilityRepository {
  createAvailability(
    data: ICreateDoctorAvailability
  ): Promise<IDoctorAvailability>;
  getAvailabilityByDoctorId(
    doctorId: string
  ): Promise<IDoctorAvailability | null>;
  updateAvailability(
    id: string,
    data: Partial<ICreateDoctorAvailability>
  ): Promise<IDoctorAvailability | null>;
  deleteAvailability(id: string): Promise<boolean>;
}
