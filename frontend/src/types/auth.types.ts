export interface User {
  id: string;
  email: string;
  username: string;
  role: "patient" | "doctor" | "admin";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  username: string;
  role: "patient" | "doctor";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type BookingStatus = "upcoming" | "completed" | "cancelled" | "no-show";
