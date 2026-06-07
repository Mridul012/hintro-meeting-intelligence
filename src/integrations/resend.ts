import { Resend } from "resend";
import { env } from "../config/env";
import logger from "../utils/logger";

const resendClient = new Resend(env.RESEND_API_KEY);

export async function sendReminderEmail(params: {
  to: string;
  assignee: string;
  task: string;
  meetingTitle: string;
  dueDate: string;
  actionItemId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await resendClient.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: [params.to],
      subject: `Reminder: "${params.task}" is overdue`,
      html: `
        <h2>Action Item Reminder</h2>
        <p>Hi ${params.assignee},</p>
        <p>The following action item from the meeting <strong>${params.meetingTitle}</strong> is overdue:</p>
        <p><strong>${params.task}</strong></p>
        <p>Due date: ${params.dueDate}</p>
        <p>Please update the status when you get a chance.</p>
        <br/>
        <p><small>This is an automated reminder from Hintro Meeting Intelligence</small></p>
      `,
    });

    logger.info({ actionItemId: params.actionItemId, to: params.to }, "Reminder email sent");
    return { success: true };
  } catch (err: any) {
    logger.error({ actionItemId: params.actionItemId, error: err?.message }, "Reminder email failed");
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}
