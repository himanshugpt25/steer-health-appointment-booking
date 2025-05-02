import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import { CustomError } from "../errors/custom.error";

dotenv.config();

interface ErrorResponse {
  code: string;
  message: string;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  if (error instanceof CustomError) {
    const response: ErrorResponse = {
      code: error.code,
      message: error.message,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
      response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(500).json(response);
};
