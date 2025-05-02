# Steer Health - Appointment Booking System

A modern appointment booking system built with Next.js, Express, and MongoDB, featuring real-time availability checks, automated reminders, and a beautiful user interface.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Redis (for job queue)
- npm or yarn

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory with the following variables:

   ```env
   PORT=8080
   MONGO_URI=your_mongodb_connection_string
   ```

   > **Important**: Make sure to whitelist your IP address in MongoDB Atlas before using the connection string.

4. **Redis Setup**
   The backend uses BullMQ for job queues (appointment reminders). You have two options:

   a. **Using Docker** (Recommended):

   ```bash
   docker run --name redis -p 6379:6379 -d redis
   ```

   b. **Using Local Redis**:

   - Install Redis on your system
   - Start the Redis server
   - The application will connect to Redis at `localhost:6379` by default

   If your Redis is running on a different host or port, add these to your `.env`:

   ```env
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   ```

5. **Start the Backend Server**
   ```bash
   npm start
   ```
   The server will start on port 8080 (or your specified PORT).

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## 🔑 Key Features

- **Real-time Availability**: Check doctor availability in real-time
- **Automated Reminders**: Email notifications for upcoming appointments
- **Time Zone Support**: Full timezone support for global users
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Backend

- Express.js
- MongoDB with Mongoose
- BullMQ for job queues
- Redis for queue management
- JWT for authentication

### Frontend

- Next.js 14
- Tailwind CSS
- TypeScript
- React Query

## 🔌 Backend API Documentation

> ⚠️ **IMPORTANT: Doctor Setup Required**
>
> Before patients can book appointments, the following setup is required:
>
> 1. Create a doctor account using `/auth/register` with `role: "doctor"`
> 2. Set up doctor's availability using `POST /availability`
>
> Without these steps, no slots will be available for booking in the frontend application.

### Authentication APIs

```http
POST /auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "securePassword123",
  "username": "Dr. John Smith",
  "role": "doctor"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "doctor@example.com",
    "username": "Dr. John Smith",
    "role": "doctor"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}

POST /auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "securePassword123"
}

Response:
{
  "user": {
    "id": "user_id",
    "email": "doctor@example.com",
    "username": "Dr. John Smith",
    "role": "doctor"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}

GET /auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
  "accessToken": "new_jwt_access_token"
}
```

### User APIs

```http
GET /users/doctors
Authorization: Bearer <access_token>

Response:
[
  {
    "id": "doctor_id",
    "username": "Dr. John Smith",
    "email": "doctor@example.com"
  }
]
```

### Availability APIs

```http
POST /availability
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "weeklySchedule": [
    {
      "dayOfWeek": 1, // Monday
      "isWorkingDay": true
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "17:00",
          "isAvailable": true
        }
      ]
    },
    {
      "dayOfWeek": 2, // Tuesday
      "isWorkingDay": false
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "17:00",
          "isAvailable": true
        }
      ]
    }
  ],
  "unavailableDates": ["2024-03-25", "2024-03-26"],
  "slotDuration": 30,
  "timezone": "America/New_York"
}

Response:
{
  "id": "availability_id",
  "doctorId": "doctor_id",
  "weeklySchedule": [...],
  "unavailableDates": [...],
  "slotDuration": 30,
  "timezone": "America/New_York",
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}

GET /availability/:doctorId
Authorization: Bearer <access_token>

Response:
{
  "id": "availability_id",
  "doctorId": "doctor_id",
  "weeklySchedule": [...],
  "unavailableDates": [...],
  "slotDuration": 30,
  "timezone": "America/New_York",
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}

GET /availability/:doctorId/slots
Authorization: Bearer <access_token>
Query Parameters:
  - date: 2024-03-25
  - timezone: America/New_York

Response:
[
  {
    "startTime": "09:00",
    "endTime": "09:30",
    "isAvailable": true
  },
  {
    "startTime": "09:30",
    "endTime": "10:00",
    "isAvailable": false
  }
]

PATCH /availability
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "weeklySchedule": [
    {
      "dayOfWeek": 1,
      "timeSlots": [
        {
          "startTime": "10:00",
          "endTime": "18:00",
          "isAvailable": true
        }
      ]
    }
  ],
  "unavailableDates": ["2024-03-27"],
  "slotDuration": 45
}

Response:
{
  "id": "availability_id",
  "doctorId": "doctor_id",
  "weeklySchedule": [...],
  "unavailableDates": [...],
  "slotDuration": 45,
  "timezone": "America/New_York",
  "updatedAt": "2024-03-20T11:00:00Z"
}
```

### Booking APIs

```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "doctorId": "doctor_id",
  "date": "2024-03-25",
  "startTime": "09:00",
  "endTime": "09:30",
  "timezone": "America/New_York",
  "reason": "Regular checkup",
  "notes": "First visit"
}

Response:
{
  "id": "booking_id",
  "doctorId": "doctor_id",
  "patientId": "patient_id",
  "date": "2024-03-25",
  "startTime": "09:00",
  "endTime": "09:30",
  "status": "pending",
  "reason": "Regular checkup",
  "notes": "First visit",
  "timezone": "America/New_York",
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}

GET /bookings/:id
Authorization: Bearer <access_token>

Response:
{
  "id": "booking_id",
  "doctorId": "doctor_id",
  "patientId": "patient_id",
  "date": "2024-03-25",
  "startTime": "09:00",
  "endTime": "09:30",
  "status": "confirmed",
  "reason": "Regular checkup",
  "notes": "First visit",
  "timezone": "America/New_York",
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}

GET /bookings/doctor/:doctorId
Authorization: Bearer <access_token>

Response:
[
  {
    "id": "booking_id",
    "doctorId": "doctor_id",
    "patientId": "patient_id",
    "date": "2024-03-25",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "confirmed",
    "reason": "Regular checkup",
    "notes": "First visit",
    "timezone": "America/New_York",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
]

GET /bookings/patient/me
Authorization: Bearer <access_token>

Response:
[
  {
    "id": "booking_id",
    "doctorId": "doctor_id",
    "doctorName": "Dr. John Smith",
    "date": "2024-03-25",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "confirmed",
    "reason": "Regular checkup",
    "notes": "First visit",
    "timezone": "America/New_York",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
]

PATCH /bookings/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "confirmed"
}

Response:
{
  "id": "booking_id",
  "status": "confirmed",
  "updatedAt": "2024-03-20T11:00:00Z"
}
```

### Authentication & Authorization

- All protected routes require a valid JWT access token
- Access tokens are obtained through login or registration
- Refresh tokens are used to obtain new access tokens
- Role-based access control is implemented for certain endpoints

### Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

Common error codes:

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., double booking)

### Rate Limiting

- API endpoints are rate-limited to prevent abuse
- Rate limits are applied per IP and per user
- Exceeding rate limits returns 429 Too Many Requests

## 📋 Project Requirements & Implementation

### Authentication Flow

- **Patient Registration**: Users can create patient accounts through the frontend login interface
- **Doctor Registration**: Doctors must be registered via the `/auth/register` API endpoint
- **Authentication**: JWT-based authentication with refresh tokens for secure access

### Appointment Booking Process

1. **Doctor Availability Setup**

   - Doctors set their weekly schedule through the availability API
   - Schedule includes:
     - Days of the week they work
     - Time slots for each day
     - Timezone preference
     - Slot duration (default: 30 minutes)

2. **Slot Generation & Selection**

   - System generates available slots based on:
     - Doctor's weekly schedule
     - Selected date
     - Existing bookings
     - Timezone considerations
   - Patients can view and select from available slots

3. **Booking Creation**

   - Before creating a booking, system performs:
     - Availability validation
     - Timezone conversion
     - Double-booking check
     - Slot conflict verification
   - Booking is created only if all validations pass

4. **Reminder System**
   - Uses BullMQ for job queue management
   - Reminders are scheduled when booking is created
   - System logs reminder message 1 hour before appointment
   - Queue is managed by Redis for reliability

### Timezone Handling

- **Multi-timezone Support**:
  - Doctor's timezone is stored with their availability
  - Patient's timezone is captured during booking
  - All slot calculations consider timezone differences
  - Bookings are stored with timezone information
  - Frontend displays times in user's local timezone

### Key Technical Achievements

1. **Concurrency Handling**

   - Prevents double bookings through validation
   - Handles race conditions in slot selection
   - Maintains data consistency across timezones

2. **Scalable Architecture**

   - Separate frontend and backend services
   - Job queue for asynchronous tasks
   - Efficient database queries and indexing

3. **User Experience**
   - Real-time slot availability
   - Intuitive booking interface
   - Clear timezone-aware displays
   - Responsive design for all devices

## 🔮 Future Improvements & Scalability

### Race Condition Handling

To handle high-concurrency scenarios and prevent double bookings at scale, we plan to implement a robust slot reservation system:

1. **Redis-based Slot Reservation System**

   ```typescript
   // Key structure for slot reservation
   const SLOT_KEY = `slot:${doctorId}:${date}:${startTime}`;
   const SESSION_KEY = `session:${userId}:${doctorId}:${date}`;

   // Implementation of slot reservation
   async function reserveSlot(
     doctorId: string,
     date: string,
     startTime: string,
     userId: string
   ) {
     const redis = await getRedisClient();

     // Check if slot is available
     const isAvailable = await redis.get(SLOT_KEY);
     if (!isAvailable) {
       throw new Error("Slot is no longer available");
     }

     // Reserve slot with 5-minute TTL
     await redis.set(SLOT_KEY, userId, "EX", 300); // 300 seconds = 5 minutes
     await redis.set(
       SESSION_KEY,
       JSON.stringify({
         startTime,
         reservedAt: new Date().toISOString(),
         expiresAt: new Date(Date.now() + 300000).toISOString(),
       }),
       "EX",
       300
     );

     return true;
   }
   ```

2. **Booking Session Management**

   ```typescript
   // Frontend implementation
   const BookingSession = {
     async initializeSession(slot) {
       // Start 5-minute countdown
       const session = await api.reserveSlot(slot);
       if (session) {
         this.startCountdown();
         this.disableOtherSlots();
       }
     },

     startCountdown() {
       // Show countdown timer
       // Disable form submission after timeout
       // Handle session expiration
     },

     async confirmBooking() {
       // Remove slot from Redis cache
       // Create permanent booking
       // Clear session data
     },
   };
   ```

3. **Real-time Slot Updates**

   ```typescript
   // Using Redis pub/sub for real-time updates
   const redis = await getRedisClient();
   const subscriber = redis.duplicate();

   await subscriber.subscribe("slot-updates", (message) => {
     const { doctorId, date, startTime, status } = JSON.parse(message);
     // Update UI to reflect slot availability
     updateSlotAvailability(doctorId, date, startTime, status);
   });
   ```

4. **Session Recovery & Cleanup**

   ```typescript
   // Handle session recovery on page refresh
   async function recoverSession(userId: string) {
     const redis = await getRedisClient();
     const session = await redis.get(`session:${userId}:*`);

     if (session) {
       const { doctorId, date, startTime } = JSON.parse(session);
       const timeLeft = await redis.ttl(
         `slot:${doctorId}:${date}:${startTime}`
       );

       if (timeLeft > 0) {
         // Resume booking session
         return { timeLeft, slot: { doctorId, date, startTime } };
       } else {
         // Clean up expired session
         await cleanupSession(userId);
       }
     }
   }
   ```

### Implementation Strategy

1. **Backend Changes**

   - Create new Redis service for slot management
   - Implement atomic operations for slot reservation
   - Add session management endpoints
   - Implement cleanup jobs for expired sessions

2. **Frontend Changes**

   - Add booking session state management
   - Implement countdown timer component
   - Add real-time slot updates using WebSocket
   - Handle session recovery on page refresh

3. **Database Changes**

   - Add indexes for slot queries
   - Implement optimistic locking for bookings
   - Add session tracking tables

4. **Monitoring & Maintenance**
   - Track session completion rates
   - Monitor Redis memory usage
   - Implement automatic cleanup jobs
   - Add logging for debugging

### Benefits of This Approach

1. **Scalability**

   - Handles high concurrent users
   - Prevents double bookings
   - Maintains data consistency
   - Reduces database load

2. **User Experience**

   - Real-time slot availability
   - Clear booking process
   - Session recovery
   - Reduced booking conflicts

3. **System Reliability**
   - Atomic operations
   - Automatic cleanup
   - Session recovery
   - Error handling

### Technical Considerations

1. **Redis Configuration**

   ```yaml
   # redis.conf
   maxmemory 2gb
   maxmemory-policy allkeys-lru
   appendonly yes
   ```

2. **Error Handling**

   ```typescript
   try {
     await reserveSlot(doctorId, date, startTime, userId);
   } catch (error) {
     if (error.code === "SLOT_UNAVAILABLE") {
       // Handle slot taken by another user
     } else if (error.code === "SESSION_EXPIRED") {
       // Handle session timeout
     }
   }
   ```

3. **Performance Monitoring**
   ```typescript
   // Track key metrics
   const metrics = {
     slotReservations: 0,
     successfulBookings: 0,
     expiredSessions: 0,
     averageBookingTime: 0,
   };
   ```

This implementation would significantly improve the system's ability to handle concurrent bookings while maintaining data consistency and providing a better user experience.

## 📝 Important Notes

- Make sure MongoDB Atlas IP whitelist includes your development IP
- Redis must be running for appointment reminders to work
- The backend runs on port 8080 by default
- The frontend runs on port 3000 by default

## 🔄 Development Workflow

1. Start Redis server
2. Start backend server
3. Start frontend development server
4. Access the application at `http://localhost:3000`

## 🚨 Troubleshooting

If you encounter any issues:

1. Ensure MongoDB connection string is correct and IP is whitelisted
2. Verify Redis is running and accessible
3. Check if all environment variables are properly set
4. Ensure all dependencies are installed in both frontend and backend

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
