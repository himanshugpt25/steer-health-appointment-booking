import { MongoDBBookingRepository } from "../bookings/repositories/mongodb.booking.repository";
import { MongoDBAvailabilityRepository } from "../doctors/repositories/mongodb.availability.repository";
import BookingService from "../bookings/booking.service";
import AvailabilityService from "../doctors/availability.service";

export class ServiceFactory {
  private static instance: ServiceFactory;
  private bookingService: BookingService | null = null;
  private availabilityService: AvailabilityService | null = null;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  getBookingService(): BookingService {
    if (!this.bookingService) {
      const bookingRepository = new MongoDBBookingRepository();
      const availabilityRepository = new MongoDBAvailabilityRepository();
      const availabilityService = this.getAvailabilityService();
      this.bookingService = new BookingService(
        bookingRepository,
        availabilityService
      );
    }
    return this.bookingService;
  }

  getAvailabilityService(): AvailabilityService {
    if (!this.availabilityService) {
      const availabilityRepository = new MongoDBAvailabilityRepository();
      this.availabilityService = new AvailabilityService(
        availabilityRepository,
        null
      );
      const bookingService = this.getBookingService();
      this.availabilityService.setBookingService(bookingService);
    }
    return this.availabilityService;
  }
}
