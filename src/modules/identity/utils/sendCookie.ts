import express from "express";

export const setAuthCookies = (
  res: express.Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("access-token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh-token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
