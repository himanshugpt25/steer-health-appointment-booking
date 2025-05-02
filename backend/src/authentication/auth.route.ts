import express, { RequestHandler, Request, Response } from "express";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import { MongoDBUserRepository } from "../users/repositories/mongodb.user.repository";
import UserService from "../users/user.service";

const router = express.Router();

const authService = new AuthService(
  new UserService(new MongoDBUserRepository())
);
const authController = new AuthController(authService);

router.post("/register", (async (req: Request, res: Response) => {
  await authController.register(req, res);
}) as RequestHandler);

router.post("/login", (async (req: Request, res: Response) => {
  await authController.login(req, res);
}) as RequestHandler);

// Simple route to trigger token refresh
router.get("/refresh", (req: Request, res: Response) => {
  // If we reach here, it means the refresh token was valid and deserializeUser middleware
  // has already set the new access token in the response header
  res.status(200).json({ message: "Token refreshed successfully" });
});

export default router;
