import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "./config";
import { IBooking } from "../bookings/interfaces/booking.repository.interface";

// Queue name
export const BOOKING_REMINDER_QUEUE = "booking-reminder-queue";

// Create queue instance
export const bookingReminderQueue = new Queue(BOOKING_REMINDER_QUEUE, {
  connection: redisConnection,
});

// Log queue connection status
bookingReminderQueue.on("error", (error) => {
  console.error("Booking reminder queue error:", error);
});

bookingReminderQueue.on("waiting", (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

// Queue processor
const bookingReminderWorker = new Worker(
  BOOKING_REMINDER_QUEUE,
  async (job) => {
    const booking: IBooking = job.data;

    // Log the reminder
    console.log(`REMINDER: You have a booking in 1 hour!`);
    console.log(`Booking Details:`);
    console.log(`- Date: ${new Date(booking.date).toLocaleDateString()}`);
    console.log(`- Time: ${booking.startTime} - ${booking.endTime}`);
    console.log(`- Reason: ${booking.reason || "Not specified"}`);
    console.log(`- Status: ${booking.status}`);
    console.log(`- Timezone: ${booking.timezone}`);

    return { success: true };
  },
  { connection: redisConnection }
);

// Handle worker events
bookingReminderWorker.on("completed", (job) => {
  console.log(`Reminder job ${job.id} completed`);
});

bookingReminderWorker.on("failed", (job, err) => {
  console.error(`Reminder job ${job?.id} failed:`, err);
});

bookingReminderWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

bookingReminderWorker.on("ready", () => {
  console.log("Booking reminder worker is ready and connected to Redis");
});

// Function to schedule a reminder for a booking
export async function scheduleBookingReminder(booking: IBooking) {
  // console.log("booking into queue", booking);
  // Create a date object in the booking's timezone
  const bookingDate = new Date(booking.date);
  const [hours, minutes] = booking.startTime.split(":").map(Number);

  // Create a date string in ISO format with the booking's timezone
  const dateString = bookingDate.toLocaleString("en-US", {
    timeZone: booking.timezone,
  });
  const localDate = new Date(dateString);
  localDate.setHours(hours, minutes, 0, 0);

  // Calculate reminder time (1 hour before booking)
  const reminderTime = new Date(localDate.getTime() - 60 * 60 * 1000);

  // Only schedule if the reminder time is in the future
  if (reminderTime > new Date()) {
    await bookingReminderQueue.add(`reminder-${booking.id}`, booking, {
      delay: reminderTime.getTime() - Date.now(),
      jobId: `reminder-${booking.id}`,
    });
    console.log(
      `Scheduled reminder for booking ${
        booking.id
      } at ${reminderTime.toLocaleString()} (${booking.timezone})`
    );
  } else {
    console.log("reminder time is in the past");
  }
}

// Function to remove a reminder for a booking
export async function removeBookingReminder(bookingId: string) {
  try {
    const jobId = `reminder-${bookingId}`;
    const job = await bookingReminderQueue.getJob(jobId);

    if (job) {
      await job.remove();
      console.log(`Removed reminder job for booking ${bookingId}`);
    } else {
      console.log(`No reminder job found for booking ${bookingId}`);
    }
  } catch (error) {
    console.error(`Error removing reminder for booking ${bookingId}:`, error);
  }
}
