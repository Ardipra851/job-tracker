import jwt from "jsonwebtoken";
import { JwtPayload } from "../models/auth.model";

export class JwtUtils {
  static generateToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "15m",
    });
  }
  static generateRefreshToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET_REFRESH as string, {
      expiresIn: "7d",
    });
  }
  static verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  }
  static verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      process.env.JWT_SECRET_REFRESH as string
    ) as JwtPayload;
  }
}
