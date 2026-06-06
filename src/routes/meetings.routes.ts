import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createMeetingHandler,
  getMeetingHandler,
  listMeetingsHandler,
  analyzeMeetingHandler,
} from "../controllers/meetings.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Create a new meeting with transcript
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, participants, meetingDate, transcript]
 *             properties:
 *               title: { type: string, example: "Sprint Planning" }
 *               participants:
 *                 type: array
 *                 items: { type: string, format: email }
 *               meetingDate: { type: string, format: date-time }
 *               transcript:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/TranscriptEntry' }
 *     responses:
 *       201:
 *         description: Meeting created
 *       422:
 *         description: Validation error
 *   get:
 *     summary: List all meetings with pagination
 *     tags: [Meetings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of meetings
 *
 * /api/meetings/{id}:
 *   get:
 *     summary: Get a meeting by ID
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 *
 * /api/meetings/{id}/analyze:
 *   post:
 *     summary: Analyze meeting transcript with AI
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: AI analysis with citations
 *       404:
 *         description: Meeting not found
 */
router.get("/", listMeetingsHandler);
router.post("/", createMeetingHandler);
router.get("/:id", getMeetingHandler);
router.post("/:id/analyze", analyzeMeetingHandler);

export default router;
