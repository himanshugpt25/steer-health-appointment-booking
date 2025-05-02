import { fetchWithAuth } from "@/utils/fetchWithAuth";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export class AvailabilityService {
  static async getAvailableSlots(
    doctorId: string,
    date: string,
    timezone: string
  ): Promise<TimeSlot[]> {
    const response = await fetchWithAuth(
      `/availability/${doctorId}/slots?date=${date}&timezone=${timezone}`
    );

    if (!response) {
      throw new Error("Failed to fetch available slots");
    }

    return response.json();
  }
}
