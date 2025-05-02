import { Request, Response } from "express";
import AvailabilityService from "./availability.service";
import { ValidationError } from "../errors/custom.error";
import { get } from "lodash";

class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  async createAvailability(req: Request, res: Response) {
    const { weeklySchedule, unavailableDates, slotDuration, timezone } =
      req.body;
    const doctorId = get(req, "locals.user.userId");

    if (!doctorId || !weeklySchedule || !timezone) {
      throw new ValidationError("Missing required fields");
    }

    const availability = await this.availabilityService.createAvailability({
      doctorId,
      weeklySchedule,
      unavailableDates,
      slotDuration,
      timezone,
    });

    res.status(201).json(availability);
  }

  async getAvailabilityByDoctorId(req: Request, res: Response) {
    const { doctorId } = req.params;

    if (!doctorId) {
      throw new ValidationError("Doctor ID is required");
    }

    const availability =
      await this.availabilityService.getAvailabilityByDoctorId(doctorId);

    if (!availability) {
      res.status(404).json({ message: "Availability not found" });
      return;
    }

    res.status(200).json(availability);
  }

  async updateAvailability(req: Request, res: Response) {
    const { weeklySchedule, unavailableDates, slotDuration } = req.body;
    const doctorId = get(req, "locals.user.userId");

    if (!doctorId) {
      throw new ValidationError("Doctor ID is required");
    }

    const availability = await this.availabilityService.updateAvailability(
      doctorId,
      {
        weeklySchedule,
        unavailableDates,
        slotDuration,
      }
    );

    res.status(200).json(availability);
  }

  async deleteAvailability(req: Request, res: Response) {
    const doctorId = get(req, "locals.user.userId");

    if (!doctorId) {
      throw new ValidationError("Doctor ID is required");
    }

    const success = await this.availabilityService.deleteAvailability(doctorId);

    if (!success) {
      res.status(404).json({ message: "Availability not found" });
      return;
    }

    res.status(204).send();
  }

  async getAvailableSlots(req: Request, res: Response) {
    const { doctorId } = req.params;
    const { date, timezone } = req.query;

    if (!doctorId || !date || !timezone) {
      throw new ValidationError("Doctor ID, date, and timezone are required");
    }

    const slots = await this.availabilityService.getAvailableSlots(
      doctorId,
      new Date(date as string),
      timezone as string
    );

    res.status(200).json(slots);
  }
}

export default AvailabilityController;
