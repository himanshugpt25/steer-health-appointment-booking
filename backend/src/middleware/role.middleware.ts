import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { ValidationError } from "../errors/custom.error";

type UserRole = "patient" | "doctor" | "admin";

export const isAuthorized = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = get(req, "locals.user.role") as UserRole;

    if (!role || !allowedRoles.includes(role)) {
      throw new ValidationError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

// Convenience middleware for common role checks
export const isPatient = isAuthorized(["patient"]);
export const isDoctor = isAuthorized(["doctor"]);
export const isAdmin = isAuthorized(["admin"]);
export const isDoctorOrAdmin = isAuthorized(["doctor", "admin"]);
export const isPatientOrDoctor = isAuthorized(["patient", "doctor"]);
