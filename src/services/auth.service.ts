import pool from "../applications/db";
import bcrypt from "bcryptjs";
import { ResponseError } from "../errors/response.error";
import {
  AuthResponse,
  Login,
  Register,
  toAuthResponse,
  User,
} from "../models/auth.model";
import { UserValidation } from "../validations/auth.validation";
import { Validation } from "../validations/validate";
import { OkPacket, RowDataPacket } from "mysql2";
import { JwtUtils } from "../utils/jwt.util";

export class AuthServices {
  static async register(request: Register): Promise<AuthResponse> {
    const validated = Validation.validate(UserValidation.REGISTER, request);

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT 1 FROM users WHERE email = ?",
      [validated.email]
    );

    if (existing.length > 0) {
      throw new ResponseError(400, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const [result] = await pool.execute<OkPacket>(
      "INSERT INTO users (name, email, password) VALUES (?,?,?)",
      [validated.name, validated.email, hashedPassword]
    );
    const token = JwtUtils.generateToken({ id: result.insertId });
    const refreshToken = JwtUtils.generateRefreshToken({ id: result.insertId });

    const user: User = {
      id: result.insertId,
      email: validated.email,
      name: validated.name,
    };
    return toAuthResponse({
      ...user,
      token: token,
      refreshToken: refreshToken,
    } as AuthResponse);
  }

  static async login(request: Login): Promise<AuthResponse> {
    const validated = Validation.validate(UserValidation.LOGIN, request);

    const [checkEmail] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [validated.email]
    );

    if (checkEmail.length === 0) {
      throw new ResponseError(400, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      validated.password,
      checkEmail[0]?.password
    );

    if (!isPasswordValid) {
      throw new ResponseError(400, "Invalid password");
    }

    const token = JwtUtils.generateToken({ id: checkEmail[0]?.id });
    const refreshToken = JwtUtils.generateRefreshToken({
      id: checkEmail[0]?.id,
    });

    const user = {
      id: checkEmail[0]?.id,
      email: checkEmail[0]?.email,
      name: checkEmail[0]?.name,
    };

    return toAuthResponse({
      ...user,
      token: token,
      refreshToken: refreshToken,
    } as AuthResponse);
  }

  static async logout(userId: number) {
    const [checkUser] = await pool.execute<RowDataPacket[]>(
      "SELECT id from users WHERE id = ?",
      [userId]
    );

    if (checkUser.length === 0) {
      throw new ResponseError(400, "User not found");
    }
    return {
      message: "Logout successful",
    };
  }

  static async refresh(request: string): Promise<AuthResponse> {
    const refreshToken = request;
    if (!refreshToken) {
      throw new ResponseError(403, "Refresh token not found");
    }
    let verifyRefreshToken;
    verifyRefreshToken = JwtUtils.verifyRefreshToken(refreshToken);
    if (!verifyRefreshToken) {
      throw new ResponseError(403, "Invalid refresh token");
    }
    // Check user by refreshToken
    const [checkUser] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id=?",
      [verifyRefreshToken.id]
    );
    if (!checkUser) {
      throw new ResponseError(404, "User not found");
    }

    const newToken = JwtUtils.generateToken({ id: checkUser[0]?.id });
    const newRefreshToken = JwtUtils.generateRefreshToken({
      id: checkUser[0]?.id,
    });

    const user = {
      id: checkUser[0]?.id,
      email: checkUser[0]?.email,
      name: checkUser[0]?.name,
    };

    return toAuthResponse({
      ...user,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  }
}
