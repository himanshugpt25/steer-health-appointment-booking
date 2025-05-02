import UserService from "../users/user.service";
import { random, authentication } from "../helpers/passwords";
import { signJwt } from "../utils/jwt";
import config from "config";
import {
  ValidationError,
  ConflictError,
  InternalServerError,
  CustomError,
  NotFoundError,
} from "../errors/custom.error";

const accessTokenTtl = config.get<number>("accessTokenTtl");
const refreshTokenTtl = config.get<number>("refreshTokenTtl");

class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(
    email: string,
    password: string,
    username: string,
    role: "patient" | "doctor" | "admin"
  ) {
    try {
      if (!email || !password || !username || !role) {
        throw new ValidationError("Missing required fields");
      }
      let existingUser;
      try {
        existingUser = await this.userService.getUserByEmail(email);
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
      if (existingUser) {
        throw new ConflictError("User already exists");
      }
      const salt = random();
      const user = await this.userService.createUser({
        email,
        username,
        role,
        authentication: {
          salt,
          password: authentication(salt, password).toString("hex"),
        },
      });

      // Create session
      const session = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Create access token
      const accessToken = signJwt(
        { ...session, sub: user.id },
        { expiresIn: accessTokenTtl }
      );

      // Create refresh token
      const refreshToken = signJwt(
        { ...session, sub: user.id },
        { expiresIn: refreshTokenTtl }
      );

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error registering user:", error);
      throw new InternalServerError("Failed to register user");
    }
  }

  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new ValidationError("Missing required fields");
      }
      const user = await this.userService.getUserWithAuth(email);
      if (!user) {
        throw new ValidationError("User not found");
      }
      const expectedHash = authentication(
        user.authentication.salt,
        password
      ).toString("hex");
      if (user.authentication.password !== expectedHash) {
        throw new ValidationError("Invalid password");
      }

      // Create session
      const session = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Create access token
      const accessToken = signJwt(
        { ...session, sub: user.id },
        { expiresIn: accessTokenTtl }
      );

      // Create refresh token
      const refreshToken = signJwt(
        { ...session, sub: user.id },
        { expiresIn: refreshTokenTtl }
      );

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error logging in:", error);
      throw new InternalServerError("Failed to login");
    }
  }
}

export default AuthService;
