import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "test") {
  logger.info("Database client initialized");
}

export { prisma };
export default prisma;
