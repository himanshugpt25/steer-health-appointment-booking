import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { AuthenticationError } from "../errors/custom.error";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = get(req, "locals.user");

    if (!user) {
      throw new AuthenticationError("User is not authenticated");
    }
    console.log(user);
    next();
  } catch (error) {
    next(error);
  }
};
