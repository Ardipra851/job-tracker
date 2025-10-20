import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { Auth } from "../middlewares/auth.middleware";
const api = express.Router();
api.use(Auth.authenticate);
api.post("/api/auth/logout", AuthController.logout);

export default api;
