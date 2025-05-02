"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@/types/auth.types";
import BookingsList from "@/components/bookings/BookingsList";

export default function DashboardPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );

  const handleNewBooking = () => {
    router.push("/dashboard/bookings/new");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <button
          onClick={handleNewBooking}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          New Booking
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-md ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("upcoming")}
            className={`px-4 py-2 rounded-md ${
              statusFilter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-md ${
              statusFilter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-4 py-2 rounded-md ${
              statusFilter === "cancelled"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      <BookingsList
        status={statusFilter === "all" ? undefined : statusFilter}
      />
    </div>
  );
}
