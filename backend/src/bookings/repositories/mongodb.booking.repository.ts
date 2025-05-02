import { BookingModel } from "../schemas/booking.schema";
import { UserModel } from "../../users/schemas/users";
import {
  IBookingRepository,
  IBooking,
  ICreateBooking,
  BookingStatus,
} from "../interfaces/booking.repository.interface";
import { Document, Types } from "mongoose";

interface UserDocument {
  _id: Types.ObjectId;
  username: string;
}

export class MongoDBBookingRepository implements IBookingRepository {
  async createBooking(data: ICreateBooking): Promise<IBooking> {
    const booking = await BookingModel.create(data);
    return this.mapToInterface(booking);
  }

  async getBookingById(id: string): Promise<IBooking | null> {
    const booking = await BookingModel.findById(id);
    return booking ? this.mapToInterface(booking) : null;
  }

  async getBookingsByDoctorId(doctorId: string): Promise<IBooking[]> {
    const bookings = await BookingModel.find({ doctorId });
    return bookings.map((booking) => this.mapToInterface(booking));
  }

  async getBookingsByPatientId(
    patientId: string,
    status?: BookingStatus
  ): Promise<IBooking[]> {
    let bookings;
    if (status) {
      bookings = await BookingModel.find({ patientId, status });
    } else {
      bookings = await BookingModel.find({ patientId });
    }

    // Get all unique doctor IDs from the bookings
    const doctorIds = [...new Set(bookings.map((booking) => booking.doctorId))];

    // Fetch all doctors in one query
    const doctors = await UserModel.find(
      { _id: { $in: doctorIds } },
      { _id: 1, username: 1 }
    ).lean();

    // Create a map of doctor IDs to usernames
    const doctorMap = new Map(
      (doctors as UserDocument[]).map((doctor) => [
        doctor._id.toString(),
        doctor.username,
      ])
    );

    // Map bookings and include doctor name
    return bookings.map((booking) => {
      const bookingData = this.mapToInterface(booking);
      return {
        ...bookingData,
        doctorName: doctorMap.get(booking.doctorId) || "Unknown Doctor",
      };
    });
  }

  async getBookingsByDoctorIdAndDate(
    doctorId: string,
    date: Date
  ): Promise<IBooking[]> {
    // Set time to start of day for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Set time to end of day for the given date
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await BookingModel.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ startTime: 1 }); // Sort by start time

    return bookings.map((booking) => this.mapToInterface(booking));
  }

  async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<IBooking | null> {
    const booking = await BookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return booking ? this.mapToInterface(booking) : null;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await BookingModel.findByIdAndDelete(id);
    return !!result;
  }

  private mapToInterface(doc: any): IBooking {
    return {
      id: doc._id.toString(),
      doctorId: doc.doctorId,
      patientId: doc.patientId,
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      reason: doc.reason,
      notes: doc.notes,
      timezone: doc.timezone,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
