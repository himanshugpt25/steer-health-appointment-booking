import express, { Request, Response, RequestHandler } from "express";
import UserController from "./user.controller";
import UserService from "./user.service";
import { MongoDBUserRepository } from "./repositories/mongodb.user.repository";

const router = express.Router();
const userService = new UserService(new MongoDBUserRepository());
const userController = new UserController(userService);

router.get("/doctors", (async (req: Request, res: Response) => {
  await userController.getDoctors(req, res);
}) as RequestHandler);

export default router;
