import { Request, Response, NextFunction } from "express";
import { createMeeting, getMeeting, listMeetings } from "../services/meetings.service";
import { analyzeMeeting } from "../services/analysis.service";
import logger from "../utils/logger";
import { sendSuccess, sendError } from "../utils/response";
import { createMeetingSchema, listMeetingsSchema } from "../schemas/meeting.schema";

export async function createMeetingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = createMeetingSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, req.traceId);
      return;
    }

    const meeting = await createMeeting(req.user.userId, result.data);
    sendSuccess(res, meeting, 201, req.traceId);
  } catch (err) {
    next(err);
  }
}

export async function getMeetingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const meeting = await getMeeting(req.params.id as string, req.user.userId);
    sendSuccess(res, meeting, 200, req.traceId);
  } catch (err: any) {
    if (err.statusCode === 404) {
      sendError(res, err.message, "NOT_FOUND", 404, req.traceId);
      return;
    }
    next(err);
  }
}

export async function listMeetingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = listMeetingsSchema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, req.traceId);
      return;
    }

    const data = await listMeetings(req.user.userId, result.data);
    sendSuccess(res, data, 200, req.traceId);
  } catch (err) {
    next(err);
  }
}

export async function analyzeMeetingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info({ meetingId: req.params.id }, "Analysis requested");
    const analysis = await analyzeMeeting(req.params.id as string, req.user.userId);
    sendSuccess(res, analysis, 200, req.traceId);
  } catch (err: any) {
    if (err.statusCode) {
      sendError(res, err.message, "ANALYSIS_ERROR", err.statusCode, req.traceId);
      return;
    }
    next(err);
  }
}
