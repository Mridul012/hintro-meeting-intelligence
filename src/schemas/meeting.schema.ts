import { z } from "zod";

export const transcriptEntrySchema = z.object({
  timestamp: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  participants: z
    .array(z.email("Invalid participant email"))
    .min(1, "At least one participant required"),
  meetingDate: z.iso.datetime("Invalid date format, use ISO 8601"),
  transcript: z.array(transcriptEntrySchema).min(1, "Transcript cannot be empty"),
});

export const listMeetingsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type ListMeetingsInput = z.infer<typeof listMeetingsSchema>;
