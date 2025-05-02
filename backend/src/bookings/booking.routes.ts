import { Router } from "express";
import BookingController from "./booking.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { validateRequest } from "../middleware/validateRequest";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.schema";
import { ServiceFactory } from "../services/service.factory";
import {
  isDoctorOrAdmin,
  isPatient,
  isPatientOrDoctor,
} from "../middleware/role.middleware";

const router = Router();

const serviceFactory = ServiceFactory.getInstance();
const bookingService = serviceFactory.getBookingService();
const bookingController = new BookingController(bookingService);

router.use(deserializeUser);

// Create a new booking (requires authentication)
router.post("/", isPatient, validateRequest(createBookingSchema), (req, res) =>
  bookingController.createBooking(req, res)
);

// Get a booking by ID (requires authentication)
router.get("/:id", isPatientOrDoctor, (req, res) =>
  bookingController.getBookingById(req, res)
);

// Get all bookings for a doctor (requires authentication)
router.get("/doctor/:doctorId", isDoctorOrAdmin, (req, res) =>
  bookingController.getBookingsByDoctorId(req, res)
);

// Get all bookings for the authenticated patient
router.get("/patient/me", isPatient, (req, res) =>
  bookingController.getBookingsByPatientId(req, res)
);

// Update booking status (requires authentication)
router.patch(
  "/:id/status",
  isDoctorOrAdmin,
  validateRequest(updateBookingStatusSchema),
  (req, res) => bookingController.updateBookingStatus(req, res)
);

// Delete a booking (requires authentication)
router.delete("/:id", isDoctorOrAdmin, (req, res) =>
  bookingController.deleteBooking(req, res)
);

export default router;
