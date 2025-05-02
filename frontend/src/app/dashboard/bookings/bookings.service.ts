import { BookingStatus } from "@/types/auth.types";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  reason?: string;
  notes?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
  timezone: string;
}

export class BookingsService {
  static async getMyBookings(status?: BookingStatus): Promise<Booking[]> {
    const url = status
      ? `/bookings/patient/me?status=${status}`
      : `/bookings/patient/me`;

    const response = await fetchWithAuth(url);

    if (!response) {
      throw new Error("Failed to fetch bookings");
    }

    return response.json();
  }

  static async getBookingById(id: string): Promise<Booking> {
    const response = await fetchWithAuth(`/bookings/${id}`);

    if (!response) {
      throw new Error("Failed to fetch booking");
    }

    return response.json();
  }

  static async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking> {
    const response = await fetchWithAuth(`/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response) {
      throw new Error("Failed to update booking status");
    }

    return response.json();
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await fetchWithAuth("/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response) {
      throw new Error("Failed to create booking");
    }

    return response.json();
  }
}
