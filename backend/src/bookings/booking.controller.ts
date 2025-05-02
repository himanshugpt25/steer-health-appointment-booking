import { Request, Response } from "express";
import BookingService from "./booking.service";
import { ValidationError } from "../errors/custom.error";
import { get } from "lodash";
import { IUser } from "users/interfaces/user.repository.interface";
import { BookingStatus } from "./interfaces/booking.repository.interface";

interface AuthenticatedRequest extends Request {
  locals?: {
    user?: IUser;
  };
}

class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  async createBooking(req: AuthenticatedRequest, res: Response) {
    const { doctorId, date, startTime, endTime, reason, notes, timezone } =
      req.body;
    const patientId = get(req, "locals.user.userId");

    if (!patientId) {
      throw new ValidationError("Patient ID is required");
    }

    const booking = await this.bookingService.createBooking({
      doctorId,
      patientId,
      date: new Date(date),
      startTime,
      endTime,
      reason,
      notes,
      timezone,
    });

    res.status(201).json(booking);
  }

  async getBookingById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("Booking ID is required");
    }

    const booking = await this.bookingService.getBookingById(id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  }

  async getBookingsByDoctorId(req: Request, res: Response) {
    const { doctorId } = req.params;

    if (!doctorId) {
      throw new ValidationError("Doctor ID is required");
    }

    const bookings = await this.bookingService.getBookingsByDoctorId(doctorId);
    res.status(200).json(bookings);
  }

  async getBookingsByPatientId(req: Request, res: Response) {
    const patientId = get(req, "locals.user.userId");
    const status = req.query.status as BookingStatus | undefined;

    if (!patientId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = await this.bookingService.getBookingsByPatientId(
      patientId,
      status
    );
    res.status(200).json(bookings);
  }

  async updateBookingStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      throw new ValidationError("Booking ID and status are required");
    }

    const booking = await this.bookingService.updateBookingStatus(id, status);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  }

  async deleteBooking(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("Booking ID is required");
    }

    const success = await this.bookingService.deleteBooking(id);

    if (!success) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(204).send();
  }
}

export default BookingController;
