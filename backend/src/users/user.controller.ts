import UserService from "./user.service";
import { Request, Response } from "express";
class UserController {
  constructor(private readonly userService: UserService) {}

  async getDoctors(req: Request, res: Response) {
    const doctors = await this.userService.getUsersByRole("doctor");
    return res.status(200).json(doctors);
  }
}

export default UserController;
