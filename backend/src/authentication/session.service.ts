import { signJwt, verifyJwt } from "../utils/jwt";
import { get } from "lodash";
import config from "config";
import { ValidationError } from "../errors/custom.error";

const accessTokenTtl = config.get<number>("accessTokenTtl");
const refreshTokenTtl = config.get<number>("refreshTokenTtl");

export const reIssueAccessToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  const { decoded } = verifyJwt(refreshToken);

  if (!decoded || !get(decoded, "userId")) {
    throw new ValidationError("Invalid refresh token");
  }

  const session = {
    userId: get(decoded, "userId"),
    email: get(decoded, "email"),
    role: get(decoded, "role"),
  };

  const accessToken = signJwt(
    { ...session, sub: get(decoded, "sub") },
    { expiresIn: accessTokenTtl }
  );

  return accessToken;
};
