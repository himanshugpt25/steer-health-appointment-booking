"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DateSelector from "@/components/bookings/DateSelector";
import TimeSlotSelector from "@/components/bookings/TimeSlotSelector";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface Doctor {
  id: string;
  username: string;
  email: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`/users/doctors`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!response) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError("Failed to load doctors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDateSelect = (date: Date) => {
    console.log("selected date", date);
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setSelectedTimeSlot({ startTime, endTime });
  };

  const handleContinue = () => {
    if (selectedDoctor && selectedDate && selectedTimeSlot) {
      // Format date as YYYY-MM-DD using local timezone
      const formattedDate = selectedDate.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const params = new URLSearchParams({
        doctorId: selectedDoctor.id,
        date: formattedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      });
      router.push(`/dashboard/bookings/new/confirmation?${params.toString()}`);
    }
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book a New Appointment</h1>

      {/* Doctor Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select a Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className={`p-4 rounded-lg text-left transition-colors ${
                selectedDoctor?.id === doctor.id
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 hover:border-blue-500"
              }`}
            >
              <h3 className="font-semibold">{doctor.username}</h3>
              <p className="text-sm">{doctor.email}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      {selectedDoctor && (
        <div className="mb-8">
          <DateSelector
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      )}

      {/* Time Slot Selection */}
      {selectedDoctor && selectedDate && (
        <div className="mb-8">
          <TimeSlotSelector
            doctorId={selectedDoctor.id}
            selectedDate={selectedDate}
            onTimeSlotSelect={handleTimeSlotSelect}
          />
        </div>
      )}

      {/* Next Step Button */}
      {selectedDoctor && selectedDate && selectedTimeSlot && (
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Confirmation
          </button>
        </div>
      )}
    </div>
  );
}
