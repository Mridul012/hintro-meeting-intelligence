import { Request, Response, NextFunction } from "express";
import {
  createActionItem,
  updateActionItemStatus,
  listActionItems,
  getOverdueActionItems,
} from "../services/actionItems.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  createActionItemSchema,
  updateStatusSchema,
  listActionItemsSchema,
} from "../schemas/actionItem.schema";

export async function createActionItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = createActionItemSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, req.traceId);
      return;
    }

    const actionItem = await createActionItem(result.data);
    sendSuccess(res, actionItem, 201, req.traceId);
  } catch (err) {
    next(err);
  }
}

export async function updateStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, req.traceId);
      return;
    }

    const actionItem = await updateActionItemStatus(req.params.id as string, result.data);
    sendSuccess(res, actionItem, 200, req.traceId);
  } catch (err: any) {
    if (err.statusCode === 404) {
      sendError(res, err.message, "NOT_FOUND", 404, req.traceId);
      return;
    }
    next(err);
  }
}

export async function listActionItemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = listActionItemsSchema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      sendError(res, message, "VALIDATION_ERROR", 422, req.traceId);
      return;
    }

    const data = await listActionItems(result.data);
    sendSuccess(res, data, 200, req.traceId);
  } catch (err) {
    next(err);
  }
}

export async function getOverdueHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getOverdueActionItems();
    sendSuccess(res, items, 200, req.traceId);
  } catch (err) {
    next(err);
  }
}
