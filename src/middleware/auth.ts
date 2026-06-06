import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "Authentication required", "UNAUTHORIZED", 401, req.traceId);
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch {
    sendError(res, "Invalid or expired token", "INVALID_TOKEN", 401, req.traceId);
  }
}
