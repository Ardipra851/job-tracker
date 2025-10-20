import { Request } from "express";
import { JwtPayload } from "./auth.model";
export interface UserRequest extends Request {
  user?: JwtPayload;
}
