import { Request, Response } from "express";
import AuthService from "./auth.service";
import { ValidationError } from "../errors/custom.error";
import config from "config";

class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username || !role) {
      throw new ValidationError("Missing required fields");
    }

    const { user, accessToken, refreshToken } = await this.authService.register(
      email,
      password,
      username,
      role
    );

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    // Send access token in response
    res.status(201).json({
      user,
      accessToken,
    });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Missing required fields");
    }

    const { user, accessToken, refreshToken } = await this.authService.login(
      email,
      password
    );

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: config.get<number>("refreshTokenTtl") * 1000, // Convert to milliseconds
    });

    // Send access token in response body
    res.status(200).json({
      user,
      accessToken,
    });
  }
}

export default AuthController;
