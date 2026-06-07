# Testing

## How to run tests
npm test

## What's tested (10 unit tests)

### Citation validation (4 tests)
- valid citations pass without throwing
- empty citations array throws with "missing citations"
- non-existent timestamp throws with the bad timestamp in message
- empty decisions and followUpSuggestions arrays are valid

### Response formatting (2 tests)
- sendSuccess returns { traceId, success: true, data }
- sendError returns { traceId, success: false, error: { code, message } }

### Overdue detection (4 tests)
- past dueDate + PENDING → overdue
- past dueDate + COMPLETED → not overdue
- future dueDate + PENDING → not overdue
- null dueDate → not overdue

## What's NOT tested
- No integration tests against real DB or HTTP endpoints
- AI analysis not tested (would need to mock Groq SDK)
- Reminder email delivery not tested (would need to mock Resend)
- Tested these manually with curl and Postman during development

## Edge cases considered
- Empty transcript rejected by Zod before reaching service
- Re-analyzing same meeting upserts instead of duplicating
- Reminder job skips items reminded in last 24 hours
- Missing Authorization header returns 401 before hitting route handler
- Action item assignee is plain string — not tied to user accounts

## Known limitations
- No integration tests — only pure function unit tests
- If Groq returns a valid timestamp that's semantically wrong,
  grounding check won't catch it (checks existence, not accuracy)
