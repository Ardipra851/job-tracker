import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { Auth } from "../middlewares/auth.middleware";
const publicApi = express.Router();

publicApi.post("/api/auth/register", AuthController.register);
publicApi.post("/api/auth/login", AuthController.login);
publicApi.post("/api/auth/refresh", Auth.refreshToken, AuthController.refresh);

export default publicApi;
