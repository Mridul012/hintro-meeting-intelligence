import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const traceId = req.traceId;

    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, traceId);
      return;
    }

    const user = await registerUser(result.data.email, result.data.password);
    sendSuccess(res, user, 201, traceId);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const traceId = req.traceId;

    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, traceId);
      return;
    }

    const data = await loginUser(result.data.email, result.data.password);
    sendSuccess(res, data, 200, traceId);
  } catch (err: any) {
    if (err.statusCode) {
      sendError(res, err.message, "AUTH_ERROR", err.statusCode, req.traceId);
      return;
    }
    next(err);
  }
}
