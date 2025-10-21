import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { Auth } from "../middlewares/auth.middleware";
import { ApplicationController } from "../controllers/application.controller";
import { upload } from "../utils/multer.util";
const api = express.Router();
api.use(Auth.authenticate);
api.post("/api/auth/logout", AuthController.logout);

api.post(
  "/api/applications",
  upload.single("cv"),
  ApplicationController.create
);
api.get("/api/applications/:id", ApplicationController.getById);
api.get("/api/applications", ApplicationController.getAll);
api.put(
  "/api/applications/:id",
  upload.single("cv"),
  ApplicationController.update
);
api.delete("/api/applications/:id", ApplicationController.delete);

export default api;
