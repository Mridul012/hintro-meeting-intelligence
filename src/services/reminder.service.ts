import { v4 as uuidv4 } from "uuid"
import prisma from "../config/database"
import logger from "../utils/logger"
import { sendReminderEmail } from "../integrations/resend"
import { getOverdueActionItems } from "./actionItems.service"
import { isOverdue } from "../utils/overdue"

export async function processReminders(): Promise<void> {
  const jobTraceId = uuidv4()
  logger.info({ jobTraceId }, "Reminder job started")

  const overdueItems = await getOverdueActionItems()
  logger.info({ jobTraceId, count: overdueItems.length }, "Overdue items found")

  if (overdueItems.length === 0) {
    logger.info({ jobTraceId }, "nothing to do")
    return
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const item of overdueItems) {
    // double-check in case status changed between the batch query and now
    if (!isOverdue({ dueDate: item.dueDate, status: item.status })) {
      skipped++
      continue
    }

    // skip if already reminded in the last 24h
    const recent = await prisma.reminderHistory.findFirst({
      where: {
        actionItemId: item.id,
        sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    if (recent) {
      skipped++
      continue
    }

    // no per-assignee email stored, use first meeting participant as fallback
    const participants = (item.meeting as any).participants as string[]
    const recipient = participants[0] ?? "noreply@example.com"

    const result = await sendReminderEmail({
      to: recipient,
      assignee: item.assignee,
      task: item.task,
      meetingTitle: (item.meeting as any).title,
      dueDate: item.dueDate ? item.dueDate.toISOString() : "No due date",
      actionItemId: item.id,
    })

    await prisma.reminderHistory.create({
      data: {
        actionItemId: item.id,
        channel: "email",
        recipient,
        status: result.success ? "sent" : "failed",
        errorMessage: result.error ?? null,
      },
    })

    result.success ? sent++ : failed++
  }

  logger.info({ jobTraceId, sent, skipped, failed }, "Reminder job done")
}
