import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { get, set } from "lodash";
import { reIssueAccessToken } from "../authentication/session.service";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  const refreshToken = get(req, "cookies.refreshToken");

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken);

  if (decoded) {
    set(req, "locals.user", decoded);
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string);

    set(req, "locals.user", result.decoded);
    return next();
  }

  return next();
};
