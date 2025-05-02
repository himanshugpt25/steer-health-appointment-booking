import express, { Request, Response, RequestHandler } from "express";
import AvailabilityController from "./availability.controller";
import { ServiceFactory } from "../services/service.factory";
import { validateRequest } from "../middleware/validateRequest";
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
} from "./availability.schema";
import { isDoctor } from "../middleware/role.middleware";

const router = express.Router();

const serviceFactory = ServiceFactory.getInstance();
const availabilityService = serviceFactory.getAvailabilityService();
const availabilityController = new AvailabilityController(availabilityService);

// Only doctors can manage their availability
router.post("/", isDoctor, validateRequest(createAvailabilitySchema), (async (
  req: Request,
  res: Response
) => {
  await availabilityController.createAvailability(req, res);
}) as RequestHandler);

router.put("/", isDoctor, validateRequest(updateAvailabilitySchema), (async (
  req: Request,
  res: Response
) => {
  await availabilityController.updateAvailability(req, res);
}) as RequestHandler);

router.delete("/", isDoctor, (async (req: Request, res: Response) => {
  await availabilityController.deleteAvailability(req, res);
}) as RequestHandler);

// Anyone can get availability
router.get("/:doctorId", (async (req: Request, res: Response) => {
  await availabilityController.getAvailabilityByDoctorId(req, res);
}) as RequestHandler);

// Get available slots for a specific date
router.get("/:doctorId/slots", (async (req: Request, res: Response) => {
  await availabilityController.getAvailableSlots(req, res);
}) as RequestHandler);

export default router;
