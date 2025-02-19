import { NextFunction, Request, Response } from "express";
import { validateJwtToken } from "../common/JwtUtil";

export const validateJwtTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    const jwtData = validateJwtToken(token);

    if (jwtData.isRefreshToken) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    req.body.jwtData = jwtData;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }
};
