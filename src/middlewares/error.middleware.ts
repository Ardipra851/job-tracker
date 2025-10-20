import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../errors/response.error";
export default function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      errors: `Validation error: ${JSON.stringify(error)}`,
    });
  } else if (error instanceof ResponseError) {
    res.status(error.statusCode).json({
      errors: error.message,
    });
  } else {
    res.status(500).json({
      errors: error.message,
    });
  }
}
