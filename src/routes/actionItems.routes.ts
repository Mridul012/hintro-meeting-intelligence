import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createActionItemHandler,
  updateStatusHandler,
  listActionItemsHandler,
  getOverdueHandler,
} from "../controllers/actionItems.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/action-items:
 *   post:
 *     summary: Create an action item
 *     tags: [Action Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meetingId, task, assignee]
 *             properties:
 *               meetingId: { type: string, format: uuid }
 *               task: { type: string, example: "Prepare release notes" }
 *               assignee: { type: string, example: "Alice" }
 *               dueDate: { type: string, format: date-time }
 *               citations:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/Citation' }
 *     responses:
 *       201:
 *         description: Action item created
 *   get:
 *     summary: List action items with optional filters
 *     tags: [Action Items]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: assignee
 *         schema: { type: string }
 *       - in: query
 *         name: meetingId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Filtered list of action items
 *
 * /api/action-items/overdue:
 *   get:
 *     summary: Get all overdue action items
 *     tags: [Action Items]
 *     responses:
 *       200:
 *         description: List of overdue action items
 *
 * /api/action-items/{id}/status:
 *   patch:
 *     summary: Update action item status
 *     tags: [Action Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Action item not found
 */
router.get("/overdue", getOverdueHandler);
router.get("/", listActionItemsHandler);
router.post("/", createActionItemHandler);
router.patch("/:id/status", updateStatusHandler);

export default router;
