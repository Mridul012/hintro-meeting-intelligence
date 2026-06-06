import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

export default function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers["x-trace-id"] as string | undefined) ?? uuidv4();
  req.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
}
