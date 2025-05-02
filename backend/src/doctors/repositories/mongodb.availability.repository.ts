import { DoctorAvailabilityModel } from "../schemas/availability.schema";
import {
  IAvailabilityRepository,
  IDoctorAvailability,
  ICreateDoctorAvailability,
} from "../interfaces/availability.repository.interface";

export class MongoDBAvailabilityRepository implements IAvailabilityRepository {
  async createAvailability(
    data: ICreateDoctorAvailability
  ): Promise<IDoctorAvailability> {
    const availability = await DoctorAvailabilityModel.create(data);
    return this.mapToInterface(availability);
  }

  async getAvailabilityByDoctorId(
    doctorId: string
  ): Promise<IDoctorAvailability | null> {
    const availability = await DoctorAvailabilityModel.findOne({
      doctorId,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    return availability ? this.mapToInterface(availability) : null;
  }

  async updateAvailability(
    id: string,
    data: Partial<ICreateDoctorAvailability>
  ): Promise<IDoctorAvailability | null> {
    const availability = await DoctorAvailabilityModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    return availability ? this.mapToInterface(availability) : null;
  }

  async deleteAvailability(id: string): Promise<boolean> {
    const result = await DoctorAvailabilityModel.findByIdAndDelete(id);
    return !!result;
  }

  private mapToInterface(doc: any): IDoctorAvailability {
    return {
      id: doc._id.toString(),
      doctorId: doc.doctorId,
      weeklySchedule: doc.weeklySchedule,
      unavailableDates: doc.unavailableDates,
      slotDuration: doc.slotDuration,
      timezone: doc.timezone,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
