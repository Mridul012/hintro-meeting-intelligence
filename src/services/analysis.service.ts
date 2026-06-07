import Groq from "groq-sdk"
import { env } from "../config/env"
import prisma from "../config/database"
import logger from "../utils/logger"

export interface Citation { timestamp: string }
export interface CitedItem { text: string; citations: Citation[] }
export interface ActionItemAI { task: string; assignee: string; citations: Citation[] }
export interface AnalysisResult {
  summary: CitedItem[]
  actionItems: ActionItemAI[]
  decisions: CitedItem[]
  followUpSuggestions: CitedItem[]
}

const groq = new Groq({ apiKey: env.GROQ_API_KEY })

// rejects anything the AI made up or couldn't cite
export function validateAndGroundAnalysis(
  result: AnalysisResult,
  transcriptTimestamps: string[]
): void {
  const sections = [
    result.summary,
    result.actionItems,
    result.decisions,
    result.followUpSuggestions,
  ] as Array<Array<{ citations: Citation[] }>>

  for (const section of sections) {
    for (const item of section) {
      if (!item.citations || item.citations.length === 0) {
        throw new Error("AI response missing citations - grounding failed")
      }
      for (const citation of item.citations) {
        if (!transcriptTimestamps.includes(citation.timestamp)) {
          throw new Error(`AI cited non-existent timestamp: ${citation.timestamp}`)
        }
      }
    }
  }
}

export async function analyzeMeeting(
  meetingId: string,
  userId: string
): Promise<AnalysisResult> {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, userId },
    include: { analysis: true },
  })

  if (!meeting) {
    throw Object.assign(new Error("Meeting not found"), { statusCode: 404 })
  }

  const transcript = meeting.transcript as Array<{
    timestamp: string
    speaker: string
    text: string
  }>
  const transcriptTimestamps = transcript.map((t) => t.timestamp)

  const systemPrompt = `You are a precise meeting analyst. Your task is to analyze meeting transcripts and extract structured insights.

CRITICAL RULES:
1. You MUST ONLY use information explicitly stated in the transcript
2. You MUST NOT invent attendees, action items, decisions, or outcomes
3. Every single item in your response MUST include a citations array
4. Citations MUST reference exact timestamp values from the transcript
5. If something cannot be cited from the transcript, do NOT include it
6. Return ONLY valid JSON with no markdown, no code blocks, no extra text`

  const userPrompt =
    `Analyze this meeting transcript and return a JSON object with exactly this structure:
{
  "summary": [{ "text": "...", "citations": [{ "timestamp": "00:10" }] }],
  "actionItems": [{ "task": "...", "assignee": "...", "citations": [{ "timestamp": "00:20" }] }],
  "decisions": [{ "text": "...", "citations": [{ "timestamp": "..." }] }],
  "followUpSuggestions": [{ "text": "...", "citations": [{ "timestamp": "..." }] }]
}

TRANSCRIPT:
` +
    JSON.stringify(meeting.transcript, null, 2) +
    `

PARTICIPANTS: ` +
    JSON.stringify(meeting.participants) +
    `

Rules:
- Only extract action items explicitly stated in the transcript
- Only extract decisions explicitly made in the transcript
- Citations must use exact timestamp values from the transcript above
- If there are no decisions, return an empty array
- If there are no follow-up suggestions, return an empty array
- Return ONLY the JSON object, nothing else`


  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  })

  const content = completion.choices[0]?.message?.content
  

  if (!content) {
    throw new Error("AI returned empty response")
  }

  let result: AnalysisResult
  try {
    result = JSON.parse(content) as AnalysisResult
  } catch {
    throw new Error("AI returned invalid JSON")
  }

  validateAndGroundAnalysis(result, transcriptTimestamps)

  // upsert so re-analyzing doesn't create duplicate rows
  await prisma.meetingAnalysis.upsert({
    where: { meetingId },
    update: {
      summary: result.summary as any,
      actionItemsData: result.actionItems as any,
      decisions: result.decisions as any,
      followUpSuggestions: result.followUpSuggestions as any,
      updatedAt: new Date(),
    },
    create: {
      meetingId,
      summary: result.summary as any,
      actionItemsData: result.actionItems as any,
      decisions: result.decisions as any,
      followUpSuggestions: result.followUpSuggestions as any,
    },
  })

  logger.info({ meetingId }, "meeting analyzed")
  return result
}
