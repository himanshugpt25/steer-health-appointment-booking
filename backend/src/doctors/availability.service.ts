import { Types } from "mongoose";
import { MongoDBAvailabilityRepository } from "./repositories/mongodb.availability.repository";
import {
  IDoctorAvailability,
  ICreateDoctorAvailability,
  ITimeSlot,
} from "./interfaces/availability.repository.interface";
import {
  ValidationError,
  NotFoundError,
  InternalServerError,
  CustomError,
} from "../errors/custom.error";
import BookingService from "../bookings/booking.service";
import { IBooking } from "../bookings/interfaces/booking.repository.interface";
import { addMinutes, format, parse, isWithinInterval } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

class AvailabilityService {
  private bookingService: BookingService | null = null;

  constructor(
    private readonly availabilityRepository: MongoDBAvailabilityRepository,
    bookingService: BookingService | null
  ) {
    this.bookingService = bookingService;
  }

  setBookingService(bookingService: BookingService) {
    this.bookingService = bookingService;
  }

  async createAvailability(
    data: ICreateDoctorAvailability
  ): Promise<IDoctorAvailability> {
    try {
      if (!data.doctorId || !data.weeklySchedule) {
        throw new ValidationError("Missing required fields");
      }

      // Validate weekly schedule
      this.validateWeeklySchedule(data.weeklySchedule);

      return await this.availabilityRepository.createAvailability(data);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error creating availability:", error);
      throw new InternalServerError("Failed to create availability");
    }
  }

  async getAvailabilityByDoctorId(
    doctorId: string
  ): Promise<IDoctorAvailability | null> {
    try {
      if (!doctorId) {
        throw new ValidationError("Doctor ID is required");
      }
      return await this.availabilityRepository.getAvailabilityByDoctorId(
        doctorId
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching availability:", error);
      throw new InternalServerError("Failed to fetch availability");
    }
  }

  async updateAvailability(
    id: string,
    data: Partial<ICreateDoctorAvailability>
  ): Promise<IDoctorAvailability | null> {
    try {
      if (!id) {
        throw new ValidationError("Availability ID is required");
      }

      if (data.weeklySchedule) {
        this.validateWeeklySchedule(data.weeklySchedule);
      }

      const updatedAvailability =
        await this.availabilityRepository.updateAvailability(id, data);

      if (!updatedAvailability) {
        throw new NotFoundError("Availability not found");
      }

      return updatedAvailability;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error updating availability:", error);
      throw new InternalServerError("Failed to update availability");
    }
  }

  async deleteAvailability(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new ValidationError("Availability ID is required");
      }
      return await this.availabilityRepository.deleteAvailability(id);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error deleting availability:", error);
      throw new InternalServerError("Failed to delete availability");
    }
  }

  async getAvailableSlots(
    doctorId: string,
    date: Date,
    timezone: string
  ): Promise<TimeSlot[]> {
    try {
      if (!doctorId || !date || !timezone) {
        throw new ValidationError("Doctor ID, date, and timezone are required");
      }

      // Get doctor's availability
      const availability =
        await this.availabilityRepository.getAvailabilityByDoctorId(doctorId);
      if (!availability) {
        throw new NotFoundError("Doctor availability not found");
      }

      //   console.log("slot params", doctorId, date, timezone);
      //   console.log("availability", availability);

      // Get existing bookings for the date
      const existingBookings =
        await this.bookingService?.getBookingsByDoctorIdAndDate(doctorId, date);

      // Get the day of the week (0-6, where 0 is Sunday)
      const dayOfWeek = date.getDay();
      // console.log("dayOfWeek", dayOfWeek);

      // Find the schedule for the current day
      const daySchedule = availability.weeklySchedule.find(
        (schedule) => schedule.dayOfWeek === dayOfWeek
      );
      // console.log("daySchedule", daySchedule);

      if (
        !daySchedule ||
        !daySchedule.timeSlots ||
        daySchedule.timeSlots.length === 0
      ) {
        return [];
      }

      // Generate slots for each time slot in the day's schedule
      const allSlots: TimeSlot[] = [];

      for (const timeSlot of daySchedule.timeSlots) {
        if (!timeSlot.isAvailable) continue;

        const { startTime, endTime } = timeSlot;
        const slotDuration = availability.slotDuration || 30; // Default to 30 minutes

        // Parse the start and end times
        const startDateTime = parse(startTime, "HH:mm", date);
        const endDateTime = parse(endTime, "HH:mm", date);

        let currentSlot = startDateTime;
        while (currentSlot < endDateTime) {
          const slotEnd = addMinutes(currentSlot, slotDuration);
          if (slotEnd <= endDateTime) {
            allSlots.push({
              startTime: format(currentSlot, "HH:mm"),
              endTime: format(slotEnd, "HH:mm"),
              isAvailable: true,
            });
          }
          currentSlot = slotEnd;
        }
      }

      // Check each slot against existing bookings, considering timezones
      return allSlots.map((slot) => {
        const isBooked = existingBookings?.some((booking) => {
          // Use booking's timezone or default to server timezone
          const bookingTimezone = booking.timezone || timezone;

          // Create date objects for the slot times in the booking's timezone
          const slotStartDate = parse(slot.startTime, "HH:mm", date);
          const slotEndDate = parse(slot.endTime, "HH:mm", date);

          // Convert slot times to UTC for comparison
          const slotStartUTC = toZonedTime(slotStartDate, bookingTimezone);
          const slotEndUTC = toZonedTime(slotEndDate, bookingTimezone);

          // Create date objects for the booking times in the booking's timezone
          const bookingStartDate = parse(booking.startTime, "HH:mm", date);
          const bookingEndDate = parse(booking.endTime, "HH:mm", date);

          // Convert booking times to UTC for comparison
          const bookingStartUTC = toZonedTime(
            bookingStartDate,
            bookingTimezone
          );
          const bookingEndUTC = toZonedTime(bookingEndDate, bookingTimezone);

          // Check if the slot overlaps with the booking
          // A slot is considered overlapping if:
          // 1. Slot starts during the booking
          // 2. Slot ends during the booking
          // 3. Slot completely contains the booking
          const isOverlapping =
            // Slot starts during the booking
            (slotStartUTC >= bookingStartUTC && slotStartUTC < bookingEndUTC) ||
            // Slot ends during the booking
            (slotEndUTC > bookingStartUTC && slotEndUTC <= bookingEndUTC) ||
            // Slot completely contains the booking
            (slotStartUTC <= bookingStartUTC && slotEndUTC >= bookingEndUTC);

          return isOverlapping && booking.status !== "cancelled";
        });

        return {
          ...slot,
          isAvailable: !isBooked,
        };
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error getting available slots:", error);
      throw new InternalServerError("Failed to get available slots");
    }
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    durationMinutes: number,
    doctorTimezone: string,
    userTimezone: string,
    date: Date,
    doctorId: string
  ): ITimeSlot[] {
    const slots: ITimeSlot[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Convert times to Date objects in doctor's timezone
    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);

    // Convert to user's timezone
    const userStartTime = this.convertTimeToTimezone(
      startDate,
      doctorTimezone,
      userTimezone
    );
    const userEndTime = this.convertTimeToTimezone(
      endDate,
      doctorTimezone,
      userTimezone
    );

    let currentTime = new Date(userStartTime);

    while (currentTime < userEndTime) {
      const slotStartTime = this.formatTime(currentTime);

      // Calculate slot end time
      const slotEndTime = new Date(
        currentTime.getTime() + durationMinutes * 60000
      );
      if (slotEndTime > userEndTime) break;

      slots.push({
        startTime: slotStartTime,
        endTime: this.formatTime(slotEndTime),
        isAvailable: true,
      });

      // Move to next slot
      currentTime = slotEndTime;
    }

    return slots;
  }

  private convertTimeToTimezone(
    date: Date,
    fromTimezone: string,
    toTimezone: string
  ): Date {
    const fromDate = new Date(
      date.toLocaleString("en-US", { timeZone: fromTimezone })
    );
    const toDate = new Date(
      date.toLocaleString("en-US", { timeZone: toTimezone })
    );
    const diff = toDate.getTime() - fromDate.getTime();
    return new Date(date.getTime() + diff);
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  private validateWeeklySchedule(weeklySchedule: any[]): void {
    if (!Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
      throw new ValidationError("Weekly schedule must be a non-empty array");
    }

    const daysOfWeek = new Set();
    weeklySchedule.forEach((schedule) => {
      if (
        typeof schedule.dayOfWeek !== "number" ||
        schedule.dayOfWeek < 0 ||
        schedule.dayOfWeek > 6
      ) {
        throw new ValidationError("Invalid day of week");
      }
      if (daysOfWeek.has(schedule.dayOfWeek)) {
        throw new ValidationError("Duplicate day of week in schedule");
      }
      daysOfWeek.add(schedule.dayOfWeek);

      if (!Array.isArray(schedule.timeSlots)) {
        throw new ValidationError("Time slots must be an array");
      }

      schedule.timeSlots.forEach((slot: any) => {
        if (
          !this.isValidTimeFormat(slot.startTime) ||
          !this.isValidTimeFormat(slot.endTime)
        ) {
          throw new ValidationError("Invalid time format");
        }
      });
    });
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}

export default AvailabilityService;
