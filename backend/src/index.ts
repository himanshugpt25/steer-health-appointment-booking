import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { dbConnection } from "./utils/db.connection";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./authentication/auth.route";
import userRoutes from "./users/user.route";
import availabilityRoutes from "./doctors/availability.route";
import { isAuthenticated } from "./middleware/auth.middleware";
import { deserializeUser } from "./middleware/deserializeUser";
import bookingRoutes from "./bookings/booking.routes";
dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World from steer health");
});

app.use(deserializeUser);
app.use("/auth", authRoutes);
app.use("/users", isAuthenticated, userRoutes);
app.use("/availability", isAuthenticated, availabilityRoutes);
app.use("/bookings", isAuthenticated, bookingRoutes);
// Error handling middleware should be last
app.use(errorHandler);

// Start the server
const startServer = async () => {
  dbConnection()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.log("Server failed to start due to error: ", error);
      process.exit(1);
    });
};

startServer();
