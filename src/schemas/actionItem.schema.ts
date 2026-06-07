import { z } from "zod";

export const createActionItemSchema = z.object({
  meetingId: z.uuid("Invalid meeting ID"),
  task: z.string().min(1, "Task description is required"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.iso.datetime("Invalid date format").optional(),
  citations: z.array(z.object({ timestamp: z.string() })).default([]),
});

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"], {
    error: "Status must be PENDING, IN_PROGRESS, or COMPLETED",
  }),
});

export const listActionItemsSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  assignee: z.string().optional(),
  meetingId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListActionItemsInput = z.infer<typeof listActionItemsSchema>;
