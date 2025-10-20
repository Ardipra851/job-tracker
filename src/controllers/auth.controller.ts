import { Request, Response, NextFunction } from "express";
import { Login, Register } from "../models/auth.model";
import { AuthServices } from "../services/auth.service";
import { UserRequest } from "../models/user.request";
import logger from "../applications/logging";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: Register = req.body;
      const response = await AuthServices.register(request);
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: Login = req.body;
      const response = await AuthServices.login(request);
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user!.id);
      logger.debug(userId);
      const response = await AuthServices.logout(userId);
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const request = String(req.cookies.refreshToken);
      const response = await AuthServices.refresh(request);
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
