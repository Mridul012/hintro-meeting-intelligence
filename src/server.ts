import app from "./app";
import { env } from "./config/env";
import logger from "./utils/logger";
import prisma from "./config/database";
import { startReminderJob } from "./jobs/reminderJob";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  startReminderJob();
});

async function shutdown() {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
