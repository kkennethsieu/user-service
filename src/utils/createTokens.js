import jwt from "jsonwebtoken";
export const createTokens = (user) => {
  const createAccessToken = () => {
    const accessToken = jwt.sign(
      { userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return accessToken;
  };

  const createRefreshToken = () => {
    const refreshToken = jwt.sign(
      { userId: user.userId },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return refreshToken;
  };

  return {
    accessToken: createAccessToken(),
    refreshToken: createRefreshToken(),
  };
};
