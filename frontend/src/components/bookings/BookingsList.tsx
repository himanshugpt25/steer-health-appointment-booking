"use client";

import { useEffect, useState } from "react";
import {
  BookingsService,
  Booking,
} from "@/app/dashboard/bookings/bookings.service";
import { BookingStatus } from "@/types/auth.types";

interface BookingsListProps {
  status?: BookingStatus;
}

export default function BookingsList({ status }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await BookingsService.getMyBookings(status);
        setBookings(data);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [status]);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No bookings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                Appointment with Dr. {booking.doctorName}
              </h3>
              <p className="text-gray-600">
                {new Date(booking.date).toLocaleDateString()} at{" "}
                {booking.startTime}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reason: {booking.reason || "Not specified"}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === "upcoming"
                    ? "bg-blue-100 text-blue-800"
                    : booking.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
          </div>
          {booking.notes && (
            <p className="mt-2 text-sm text-gray-600">Notes: {booking.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
