import { describe, it, expect, vi } from "vitest";
import { validateAndGroundAnalysis } from "../services/analysis.service";
import { sendSuccess, sendError } from "../utils/response";
import { isOverdue } from "../utils/overdue";
import type { AnalysisResult } from "../services/analysis.service";

describe("Citation validation", () => {
  const transcriptTimestamps = ["00:10", "00:20", "00:30"];

  const validResult: AnalysisResult = {
    summary: [{ text: "Team agreed on launch", citations: [{ timestamp: "00:10" }] }],
    actionItems: [{ task: "Write docs", assignee: "Alice", citations: [{ timestamp: "00:20" }] }],
    decisions: [{ text: "Launch on Friday", citations: [{ timestamp: "00:30" }] }],
    followUpSuggestions: [{ text: "Schedule follow-up", citations: [{ timestamp: "00:10" }] }],
  };

  it("passes when all items have valid citations", () => {
    expect(() => validateAndGroundAnalysis(validResult, transcriptTimestamps)).not.toThrow();
  });

  it("throws when an item has no citations", () => {
    const result: AnalysisResult = {
      ...validResult,
      summary: [{ text: "No citation here", citations: [] }],
    };
    expect(() => validateAndGroundAnalysis(result, transcriptTimestamps)).toThrow("missing citations");
  });

  it("throws when a citation references a non-existent timestamp", () => {
    const result: AnalysisResult = {
      ...validResult,
      actionItems: [{ task: "Ghost task", assignee: "Bob", citations: [{ timestamp: "99:99" }] }],
    };
    expect(() => validateAndGroundAnalysis(result, ["00:10", "00:20"])).toThrow("99:99");
  });

  it("passes with empty decisions and followUpSuggestions arrays", () => {
    const result: AnalysisResult = {
      summary: [{ text: "Summary point", citations: [{ timestamp: "00:10" }] }],
      actionItems: [{ task: "Do thing", assignee: "Carol", citations: [{ timestamp: "00:20" }] }],
      decisions: [],
      followUpSuggestions: [],
    };
    expect(() => validateAndGroundAnalysis(result, transcriptTimestamps)).not.toThrow();
  });
});

describe("Response formatting", () => {
  it("sendSuccess returns the correct envelope", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const mockRes = { status } as any;

    sendSuccess(mockRes, { id: "123" }, 200, "trace-abc");

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      traceId: "trace-abc",
      success: true,
      data: { id: "123" },
    });
  });

  it("sendError returns the correct error envelope", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const mockRes = { status } as any;

    sendError(mockRes, "Not found", "NOT_FOUND", 404, "trace-xyz");

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      traceId: "trace-xyz",
      success: false,
      error: { code: "NOT_FOUND", message: "Not found" },
    });
  });
});

describe("Overdue detection", () => {
  it("returns true for a past dueDate with PENDING status", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60);
    expect(isOverdue({ dueDate: past, status: "PENDING" })).toBe(true);
  });

  it("returns false for a COMPLETED item regardless of dueDate", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60);
    expect(isOverdue({ dueDate: past, status: "COMPLETED" })).toBe(false);
  });

  it("returns false for a future dueDate", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(isOverdue({ dueDate: future, status: "PENDING" })).toBe(false);
  });

  it("returns false when dueDate is null", () => {
    expect(isOverdue({ dueDate: null, status: "PENDING" })).toBe(false);
  });
});
