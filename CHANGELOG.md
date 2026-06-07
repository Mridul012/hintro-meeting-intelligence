# Changelog

## v0.5 — docs, tests, cleanup

* wrote unit tests for citation validation, overdue logic, and response formatting
* added Swagger UI at /api-docs
* added health and evaluation endpoints
* had to exclude prisma.config.ts and vitest.config.ts from tsconfig because tsc was picking them up outside rootDir
* zod 4 changed a few APIs I was using (z.string().email() → z.email(), datetime helpers, etc.), updated the validation schemas
* ended up using Prisma 5 because Prisma 7 currently doesn't support MySQL without an adapter setup

## v0.4 — reminders

* added node-cron scheduler (runs every 15 minutes)
* integrated Resend for reminder emails
* added reminder_history table to track reminder attempts
* added a 24-hour deduplication check so the same task doesn't get emailed every 15 minutes

## v0.3 — action items

* added action item CRUD (create, list, update status)
* implemented overdue detection (status != COMPLETED and dueDate < current time)
* added GET /api/action-items/overdue
* pulled isOverdue into a separate utility so it could be tested independently

## v0.2 — AI analysis

* integrated Groq using llama-3.3-70b-versatile
* took a few iterations on the prompt before citations became reliable
* added validateAndGroundAnalysis to reject analyses without valid transcript timestamps
* added upsert on re-analyze so duplicate MeetingAnalysis rows are not created
* lowered temperature to 0.1 because this is extraction, not creative generation

## v0.1 — getting started

* set up Express + TypeScript + Prisma + MySQL
* implemented JWT authentication (register/login)
* added meeting CRUD with pagination
* added trace IDs to all requests
* added global error handling
* added Zod validation across API endpoints
