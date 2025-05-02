import { SignupCredentials, AuthResponse } from "@/types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class SignupService {
  static async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }
}
