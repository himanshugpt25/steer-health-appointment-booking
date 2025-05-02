"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingsService } from "../../bookings.service";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reason: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        doctorId: searchParams.get("doctorId") || "",
        date: searchParams.get("date") || "",
        startTime: searchParams.get("startTime") || "",
        endTime: searchParams.get("endTime") || "",
        reason: formData.reason,
        notes: formData.notes || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await BookingsService.createBooking(bookingData);
      router.push("/dashboard"); // Redirect to dashboard after successful booking
    } catch (err) {
      setError("Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Confirm Your Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Visit *
          </label>
          <input
            type="text"
            id="reason"
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please provide a brief reason for your visit"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional information you'd like to share"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
