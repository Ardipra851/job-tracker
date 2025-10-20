import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user.request";
import { json } from "zod";
import { JwtUtils } from "../utils/jwt.util";
import logger from "../applications/logging";

export class Auth {
  static authenticate(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader && !authHeader?.startsWith("Bearer ")) {
        res.status(401),
          json({
            error: "Unauthorized",
          });
      }
      const token = authHeader!.split(" ")[1];
      if (!token) {
        res.status(401),
          json({
            error: "Unauthorized",
          });
      }
      const user = JwtUtils.verifyToken(token as string);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

  static refreshToken(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          error: "Unauthorized",
        });
      }
      logger.info(`refreshToken: ${refreshToken}`);
      const user = JwtUtils.verifyRefreshToken(refreshToken as string);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }
}
