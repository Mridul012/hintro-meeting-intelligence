import cron from "node-cron";
import { processReminders } from "../services/reminder.service";
import logger from "../utils/logger";

export function startReminderJob(): void {
  logger.info("Reminder job scheduler started");

  cron.schedule("*/15 * * * *", async () => {
    try {
      await processReminders();
    } catch (err) {
      logger.error({ err }, "Reminder job crashed unexpectedly");
    }
  });

  if (process.env.NODE_ENV === "development") {
    setTimeout(() => {
      processReminders().catch((err) =>
        logger.error({ err }, "Initial reminder run failed")
      );
    }, 5000);
  }
}
