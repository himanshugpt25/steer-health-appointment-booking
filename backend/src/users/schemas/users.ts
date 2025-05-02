import mongoose, { Document } from "mongoose";
import { IUser } from "../interfaces/user.repository.interface";

// Extend IUser for MongoDB specific fields
export interface IUserDocument extends Omit<IUser, "id">, Document {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["patient", "doctor", "admin"],
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
