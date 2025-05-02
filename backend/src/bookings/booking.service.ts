import { MongoDBBookingRepository } from "./repositories/mongodb.booking.repository";
import AvailabilityService from "../doctors/availability.service";
import {
  IBooking,
  ICreateBooking,
  BookingStatus,
} from "./interfaces/booking.repository.interface";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  CustomError,
} from "../errors/custom.error";
import { scheduleBookingReminder, removeBookingReminder } from "../queues";
import { parse, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

class BookingService {
  constructor(
    private readonly bookingRepository: MongoDBBookingRepository,
    private readonly availabilityService: AvailabilityService
  ) {}

  async createBooking(data: ICreateBooking): Promise<IBooking> {
    try {
      // Validate required fields
      if (
        !data.doctorId ||
        !data.patientId ||
        !data.date ||
        !data.startTime ||
        !data.endTime ||
        !data.timezone
      ) {
        throw new ValidationError("Missing required fields");
      }

      // Check if the slot is available
      const availability =
        await this.availabilityService.getAvailabilityByDoctorId(data.doctorId);
      if (!availability) {
        throw new NotFoundError("Doctor availability not found");
      }

      // Get the day of the week (0-6, where 0 is Sunday)
      const dayOfWeek = data.date.getDay();

      // Find the schedule for the current day
      const daySchedule = availability.weeklySchedule.find(
        (schedule) => schedule.dayOfWeek === dayOfWeek
      );

      if (
        !daySchedule ||
        !daySchedule.timeSlots ||
        daySchedule.timeSlots.length === 0
      ) {
        throw new ValidationError("Doctor is not available on this day");
      }

      // Convert booking times to doctor's timezone for comparison
      const doctorTimezone = availability.timezone;
      const bookingTimezone = data.timezone;

      // Create date objects for the booking times in the booking's timezone
      const bookingStartDate = parse(
        `${format(data.date, "yyyy-MM-dd")}T${data.startTime}`,
        "yyyy-MM-dd'T'HH:mm",
        new Date()
      );
      const bookingEndDate = parse(
        `${format(data.date, "yyyy-MM-dd")}T${data.endTime}`,
        "yyyy-MM-dd'T'HH:mm",
        new Date()
      );

      // Convert booking times to doctor's timezone
      const doctorStartTime = toZonedTime(bookingStartDate, doctorTimezone);
      const doctorEndTime = toZonedTime(bookingEndDate, doctorTimezone);

      // Format times in doctor's timezone for comparison
      const doctorStartTimeStr = format(doctorStartTime, "HH:mm");
      const doctorEndTimeStr = format(doctorEndTime, "HH:mm");

      // Check if the requested slot falls within any of the available time slots
      const isSlotAvailable = daySchedule.timeSlots.some(
        (timeSlot) =>
          timeSlot.isAvailable &&
          doctorStartTimeStr >= timeSlot.startTime &&
          doctorEndTimeStr <= timeSlot.endTime
      );

      if (!isSlotAvailable) {
        throw new ValidationError(
          "Requested time slot is not within doctor's available hours"
        );
      }

      // Check if there's already a booking for this slot
      const existingBookings =
        await this.bookingRepository.getBookingsByDoctorIdAndDate(
          data.doctorId,
          data.date
        );

      // Convert new booking times to doctor's timezone for comparison
      const newBookingStartDate = parse(
        `${format(data.date, "yyyy-MM-dd")}T${data.startTime}`,
        "yyyy-MM-dd'T'HH:mm",
        new Date()
      );
      const newBookingEndDate = parse(
        `${format(data.date, "yyyy-MM-dd")}T${data.endTime}`,
        "yyyy-MM-dd'T'HH:mm",
        new Date()
      );

      const newBookingStartInDoctorTz = toZonedTime(
        newBookingStartDate,
        doctorTimezone
      );
      const newBookingEndInDoctorTz = toZonedTime(
        newBookingEndDate,
        doctorTimezone
      );

      const isSlotBooked = existingBookings.some((booking) => {
        if (booking.status === "cancelled") return false;

        // Create date objects for existing booking times in its timezone
        const existingBookingStartDate = parse(
          `${format(booking.date, "yyyy-MM-dd")}T${booking.startTime}`,
          "yyyy-MM-dd'T'HH:mm",
          new Date()
        );
        const existingBookingEndDate = parse(
          `${format(booking.date, "yyyy-MM-dd")}T${booking.endTime}`,
          "yyyy-MM-dd'T'HH:mm",
          new Date()
        );

        // Convert existing booking times to doctor's timezone
        const existingBookingStartInDoctorTz = toZonedTime(
          existingBookingStartDate,
          booking.timezone
        );
        const existingBookingEndInDoctorTz = toZonedTime(
          existingBookingEndDate,
          booking.timezone
        );

        // Check for overlap in doctor's timezone
        const isOverlapping =
          // New booking starts during existing booking
          (newBookingStartInDoctorTz >= existingBookingStartInDoctorTz &&
            newBookingStartInDoctorTz < existingBookingEndInDoctorTz) ||
          // New booking ends during existing booking
          (newBookingEndInDoctorTz > existingBookingStartInDoctorTz &&
            newBookingEndInDoctorTz <= existingBookingEndInDoctorTz) ||
          // New booking completely contains existing booking
          (newBookingStartInDoctorTz <= existingBookingStartInDoctorTz &&
            newBookingEndInDoctorTz >= existingBookingEndInDoctorTz);

        return isOverlapping;
      });

      if (isSlotBooked) {
        throw new ConflictError("This time slot is already booked");
      }

      // Create the booking
      const booking = await this.bookingRepository.createBooking({
        ...data,
        status: "upcoming",
      });

      // Schedule reminder for the booking
      await scheduleBookingReminder(booking);

      return booking;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error creating booking:", error);
      throw new InternalServerError("Failed to create booking");
    }
  }

  async getBookingById(id: string): Promise<IBooking | null> {
    try {
      if (!id) {
        throw new ValidationError("Booking ID is required");
      }
      return await this.bookingRepository.getBookingById(id);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching booking:", error);
      throw new InternalServerError("Failed to fetch booking");
    }
  }

  async getBookingsByDoctorId(doctorId: string): Promise<IBooking[]> {
    try {
      if (!doctorId) {
        throw new ValidationError("Doctor ID is required");
      }
      return await this.bookingRepository.getBookingsByDoctorId(doctorId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching doctor bookings:", error);
      throw new InternalServerError("Failed to fetch doctor bookings");
    }
  }

  async getBookingsByPatientId(
    patientId: string,
    status?: BookingStatus
  ): Promise<IBooking[]> {
    try {
      if (!patientId) {
        throw new ValidationError("Patient ID is required");
      }
      return await this.bookingRepository.getBookingsByPatientId(
        patientId,
        status
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching patient bookings:", error);
      throw new InternalServerError("Failed to fetch patient bookings");
    }
  }

  async getBookingsByDoctorIdAndDate(
    doctorId: string,
    date: Date
  ): Promise<IBooking[]> {
    try {
      if (!doctorId) {
        throw new ValidationError("Doctor ID is required");
      }
      if (!date) {
        throw new ValidationError("Date is required");
      }

      return await this.bookingRepository.getBookingsByDoctorIdAndDate(
        doctorId,
        date
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching doctor bookings for date:", error);
      throw new InternalServerError("Failed to fetch doctor bookings for date");
    }
  }

  async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<IBooking | null> {
    try {
      if (!id || !status) {
        throw new ValidationError("Booking ID and status are required");
      }

      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new NotFoundError("Booking not found");
      }

      const updatedBooking = await this.bookingRepository.updateBookingStatus(
        id,
        status
      );

      // If the booking is cancelled, remove the reminder
      if (status === "cancelled" && updatedBooking) {
        await removeBookingReminder(id);
      }

      return updatedBooking;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error updating booking status:", error);
      throw new InternalServerError("Failed to update booking status");
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new ValidationError("Booking ID is required");
      }
      return await this.bookingRepository.deleteBooking(id);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error deleting booking:", error);
      throw new InternalServerError("Failed to delete booking");
    }
  }
}

export default BookingService;
