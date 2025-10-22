import express from "express";
import errorMiddleware from "../middlewares/error.middleware";
import publicApi from "../routers/public.router";
import "dotenv/config";
import cookiParser from "cookie-parser";
import api from "../routers/auth.router";
import limit from "../utils/rate-limiter.utils";

const app = express();
app.use(express.json());
app.use(cookiParser());

app.use(limit, publicApi);
app.use(api);

app.use(errorMiddleware);

export default app;
