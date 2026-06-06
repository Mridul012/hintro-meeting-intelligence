import { Response } from "express";

export function sendSuccess(res: Response, data: unknown, statusCode = 200, traceId = "") {
  return res.status(statusCode).json({ traceId, success: true, data });
}

export function sendError(res: Response, message: string, code: string, statusCode = 400, traceId = "") {
  return res.status(statusCode).json({
    traceId,
    success: false,
    error: { code, message },
  });
}
