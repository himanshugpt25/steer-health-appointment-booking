"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AvailabilityService,
  TimeSlot,
} from "@/app/dashboard/bookings/availability.service";

interface TimeSlotSelectorProps {
  doctorId: string;
  selectedDate: Date;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
}

export default function TimeSlotSelector({
  doctorId,
  selectedDate,
  onTimeSlotSelect,
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get user's timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Format date as YYYY-MM-DD using local timezone
        const formattedDate = selectedDate.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: timezone,
        });

        const slots = await AvailabilityService.getAvailableSlots(
          doctorId,
          formattedDate,
          timezone
        );
        setTimeSlots(slots);
      } catch (err) {
        setError("Failed to load available time slots");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && selectedDate) {
      fetchTimeSlots();
    }
  }, [doctorId, selectedDate]);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    onTimeSlotSelect(slot.startTime, slot.endTime);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No available time slots for this date
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">
        Available Time Slots for {format(selectedDate, "MMMM d, yyyy")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleSlotSelect(slot)}
            disabled={!slot.isAvailable}
            className={`p-3 rounded-lg text-center transition-colors ${
              !slot.isAvailable
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : selectedSlot?.startTime === slot.startTime
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 hover:border-blue-500"
            }`}
          >
            {format(new Date(`2000-01-01T${slot.startTime}`), "h:mm a")} -{" "}
            {format(new Date(`2000-01-01T${slot.endTime}`), "h:mm a")}
            {/* {!slot.isAvailable && (
              <span className="block text-xs mt-1">Unavailable</span>
            )} */}
          </button>
        ))}
      </div>
    </div>
  );
}
