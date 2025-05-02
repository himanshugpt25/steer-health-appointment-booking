"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface DateSelectorProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export default function DateSelector({
  onDateSelect,
  selectedDate,
}: DateSelectorProps) {
  const [dates, setDates] = useState<Date[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    generateDates(currentBatch);
  }, [currentBatch]);

  const generateDates = (batch: number) => {
    const startDate = addDays(startOfDay(new Date()), batch * 7);
    const newDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setDates(newDates);

    // Check if we're showing the current week
    const today = startOfDay(new Date());
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const isCurrentWeek = newDates.some(
      (date) =>
        !isBefore(date, currentWeekStart) && !isAfter(date, currentWeekEnd)
    );

    setCanGoBack(!isCurrentWeek);
  };

  const handleNext = () => {
    setCurrentBatch((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentBatch((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Select a Date</h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevious}
            disabled={!canGoBack}
            className={`px-3 py-1 rounded-md ${
              canGoBack
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {dates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            disabled={isBefore(date, startOfDay(new Date()))}
            className={`flex-shrink-0 w-24 h-24 rounded-lg flex flex-col items-center justify-center p-2 transition-colors ${
              selectedDate && isSameDay(date, selectedDate)
                ? "bg-blue-600 text-white"
                : isBefore(date, startOfDay(new Date()))
                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-200 hover:border-blue-500"
            }`}
          >
            <span className="text-sm font-medium">{format(date, "EEE")}</span>
            <span className="text-2xl font-bold">{format(date, "d")}</span>
            <span className="text-xs">{format(date, "MMM")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
