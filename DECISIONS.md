# Technical Decisions

## Database: MySQL + Prisma 5

Went with MySQL because I already had it running locally. PostgreSQL 
would have been fine too - Prisma abstracts most of the differences 
for this use case anyway.

Tried Prisma 7 first. Hit a wall — Prisma 7 dropped native MySQL TCP 
support and needs a driver adapter, but @prisma/adapter-mysql doesn't 
exist yet. Downgraded to Prisma 5 which just works with a connection string.

participants and transcript are stored as JSON columns since MySQL 
doesn't have array types. Works fine here because both are always 
read/written as a complete unit, never queried partially.

## Authentication: JWT

Stateless, no session table or Redis needed. 1 hour expiry.

Considered sessions but that adds infrastructure (need somewhere to 
store them). API keys don't expire cleanly. OAuth is overkill for 
this scope.

Downside: can't invalidate a token before expiry without a blocklist. 
Acceptable for a 1-hour window.

## AI Provider: Groq

Fast (under 2 seconds on typical transcripts), free tier works, and 
response_format: json_object means I get parseable JSON back without 
stripping markdown.

Considered OpenAI but the free tier rate limits are restrictive. 
Claude and Gemini would have worked too but Groq was the easiest 
to get running quickly.

temperature: 0.1 because this is extraction not generation — 
lower temperature keeps the model closer to what's actually in 
the transcript.

## External Integration: Resend

Simplest email API I found. Three lines to send an email. Free tier 
was enough to test the reminder workflow end to end.

Discord webhook would have been even simpler but email makes more 
sense for a meeting tool. Slack requires a workspace to demo.

Resend free tier only delivers to your own verified email until you 
add a custom domain — fine for this assignment, would need a real 
domain in production.

## Transcript storage: JSON column

Thought about a separate TranscriptEntry table but transcripts are 
always read and written as a complete unit. Never need to query 
individual entries via SQL. JSON column is simpler and faster.

## Project structure: functions not classes

Routes → Controllers → Services → Prisma. Plain exported async functions.

Could have used classes with dependency injection but that felt like 
over-engineering for this scope. Functions are easier to test and 
less boilerplate.

