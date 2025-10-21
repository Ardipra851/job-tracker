import multer from "multer";
import path from "path";
import fs from "fs";
import { UserRequest } from "../models/user.request";
import { ResponseError } from "../errors/response.error";
import pool from "../applications/db";
import { RowDataPacket } from "mysql2";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/cv");

    // Create folder if folder not exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: async (req: UserRequest, file, cb) => {
    const userId = Number(req.user!.id);
    if (!userId) {
      throw new ResponseError(404, "User not found");
    }
    const [user] = await pool.execute<RowDataPacket[]>(
      "SELECT name FROM users WHERE id = ?",
      [userId]
    );
    if (user.length === 0) {
      throw new ResponseError(404, "User not found");
    }

    // Get name from database
    const name = user[0]!.name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "_");
    const date = new Date();
    cb(null, name + "_" + date.getTime() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
