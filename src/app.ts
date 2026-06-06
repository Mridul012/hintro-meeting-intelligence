import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import traceIdMiddleware from "./middleware/traceId";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import meetingsRoutes from "./routes/meetings.routes";
import actionItemsRoutes from "./routes/actionItems.routes";
import logger from "./utils/logger";
import { swaggerSpec } from "./docs/swagger";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(traceIdMiddleware);

app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path, traceId: req.traceId }, "incoming request");
  res.on("finish", () => {
    logger.info({ method: req.method, path: req.path, status: res.statusCode, traceId: req.traceId }, "response sent");
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({ traceId: req.traceId, success: true, data: { status: "UP" } });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/action-items", actionItemsRoutes);

app.get("/api/evaluation", (req, res) => {
  res.json({
    traceId: req.traceId,
    success: true,
    data: {
      candidateName: "Mridul",
      email: "iammridul012@gmail.com",
      repositoryUrl: "https://github.com/Mridul012/hintro-meeting-intelligence",
      deployedUrl: "https://placeholder.com",
      externalIntegration: "Resend Email",
      features: [
        "Authentication",
        "Meeting Management",
        "AI Analysis",
        "Action Items",
        "Reminder Scheduler",
      ],
    },
  });
});

app.use(errorHandler);

export default app;
