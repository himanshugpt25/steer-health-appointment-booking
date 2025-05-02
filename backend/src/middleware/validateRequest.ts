import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../errors/custom.error";

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError(JSON.stringify(errors));
      }
      return next(error);
    }
  };
