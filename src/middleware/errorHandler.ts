import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { sendError } from "../utils/response";


export default function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error({
    traceId: req.traceId,
    method: req.method,
    path: req.path,
    msg: err.message,
  });

  const statusCode: number = err.statusCode ?? 500;
  const code: string = err.code ?? "INTERNAL_ERROR";

  sendError(res, err.message ?? "Something went wrong", code, statusCode, req.traceId);
}
