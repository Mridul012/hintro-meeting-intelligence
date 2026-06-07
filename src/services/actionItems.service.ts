import prisma from "../config/database";
import logger from "../utils/logger";
import {
  CreateActionItemInput,
  UpdateStatusInput,
  ListActionItemsInput,
} from "../schemas/actionItem.schema";
import { ActionItemStatus } from "@prisma/client";

export async function createActionItem(data: CreateActionItemInput) {
  const meeting = await prisma.meeting.findUnique({ where: { id: data.meetingId } });
  if (!meeting) {
    throw Object.assign(new Error("Meeting not found"), { statusCode: 404 });
  }

  const actionItem = await prisma.actionItem.create({
    data: {
      meetingId: data.meetingId,
      task: data.task,
      assignee: data.assignee,
      status: "PENDING",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      citations: data.citations as any,
    },
  });

  logger.info({ id: actionItem.id, meetingId: actionItem.meetingId }, "Action item created");
  return actionItem;
}

export async function updateActionItemStatus(id: string, data: UpdateStatusInput) {
  const existing = await prisma.actionItem.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Action item not found"), { statusCode: 404 });
  }

  const actionItem = await prisma.actionItem.update({
    where: { id },
    data: { status: data.status as ActionItemStatus, updatedAt: new Date() },
  });

  logger.info({ id, status: data.status }, "Action item status updated");
  return actionItem;
}

export async function listActionItems(query: ListActionItemsInput) {
  const where: {
    status?: ActionItemStatus;
    assignee?: { contains: string };
    meetingId?: string;
  } = {};
  if (query.status) where.status = query.status as ActionItemStatus;
  if (query.assignee) where.assignee = { contains: query.assignee };
  if (query.meetingId) where.meetingId = query.meetingId;

  const skip = (query.page - 1) * query.limit;

  const [actionItems, total] = await Promise.all([
    prisma.actionItem.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      include: { meeting: { select: { title: true } } },
    }),
    prisma.actionItem.count({ where }),
  ]);

  return {
    actionItems,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getOverdueActionItems() {
  return prisma.actionItem.findMany({
    where: {
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date(), not: null },
    },
    include: { meeting: { select: { title: true, participants: true } } },
    orderBy: { dueDate: "asc" },
  });
}
