import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);

export const dbConnection = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.on("error", (error) => {
      console.log("MongoDB connection error. Terminating the application...");
      reject(error);
    });
    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB");
      resolve(true);
    });
  });
};
