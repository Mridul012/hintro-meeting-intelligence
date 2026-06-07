# Hintro Meeting Intelligence API

REST API that lets you upload meeting transcripts, run AI analysis to extract 
action items and decisions (every item cited back to a specific transcript 
timestamp), and get email reminders for overdue tasks.

Built for the Hintro Backend/Fullstack Engineering Internship assignment.

## Stack

Node.js 22 · TypeScript · Express · Prisma 5 + MySQL · Groq (Llama 3.3 70B) · Zod 4 · JWT · Resend · node-cron · Swagger UI

## Local setup

```bash
git clone https://github.com/YOUR_USERNAME/hintro-meeting-intelligence.git
cd hintro-meeting-intelligence
npm install
cp .env.example .env
# fill in .env with your values
```

Create the MySQL database:
```bash
mysql -u root -p -e "CREATE DATABASE hintro_db;"
```

MySQL 8 uses caching_sha2_password by default which Prisma 5 doesn't support.
Fix it:
```bash
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';"
```

Run migrations and start:
```bash
npx prisma migrate dev
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | `mysql://root:pass@localhost:3306/hintro_db` |
| `JWT_SECRET` | min 32 characters |
| `JWT_EXPIRES_IN` | e.g. `1h` |
| `PORT` | default `3000` |
| `NODE_ENV` | `development` / `production` / `test` |
| `GROQ_API_KEY` | from console.groq.com |
| `RESEND_API_KEY` | from resend.com/api-keys |
| `RESEND_FROM_EMAIL` | verified sender address (use `onboarding@resend.dev` for testing) |

## API docs

Swagger UI: `http://localhost:3000/api-docs`
Health check: `http://localhost:3000/health`
Evaluation: `http://localhost:3000/api/evaluation`

## Quick examples

**Register and login**
```http
POST /api/auth/register
{"email": "user@example.com", "password": "password123"}

POST /api/auth/login
{"email": "user@example.com", "password": "password123"}
# returns { token }
```

**Create a meeting**
```http
POST /api/meetings
Authorization: Bearer <token>

{
  "title": "Sprint Planning",
  "participants": ["alice@example.com"],
  "meetingDate": "2026-05-20T10:00:00Z",
  "transcript": [
    {"timestamp": "00:10", "speaker": "John", "text": "We should launch next Friday."},
    {"timestamp": "00:20", "speaker": "Alice", "text": "I'll prepare the release notes."}
  ]
}
```

**Run AI analysis**
```http
POST /api/meetings/:id/analyze
Authorization: Bearer <token>
```
Returns summary, action items, decisions, and follow-up suggestions.
Every item is cited back to a specific transcript timestamp.
Re-running replaces the previous analysis.

**Action items**
```http
POST /api/action-items
GET  /api/action-items?status=PENDING&assignee=Alice&meetingId=xxx
PATCH /api/action-items/:id/status
GET  /api/action-items/overdue
```

## Reminder scheduler

Cron job runs every 15 minutes. For each overdue action item:
1. Checks if a reminder was already sent in the last 24 hours (skip if yes)
2. Sends an email via Resend to the first participant of that meeting
3. Records the attempt in ReminderHistory (success or failure)

In development, an initial pass runs 5 seconds after startup so you
don't have to wait 15 minutes to test it.

## Tests

```bash
npm test
```

10 unit tests covering:
- Citation grounding validation (4 tests)
- Response envelope formatting (2 tests)  
- Overdue detection logic (4 tests)

## Deployment

### Railway (recommended)

1. Push repo to GitHub (public)
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Add MySQL: New → Database → MySQL
4. Copy `DATABASE_URL` from MySQL service Variables tab
5. Add environment variables in your app service Variables tab
6. Set build command: `npm run build && npx prisma generate && npx prisma migrate deploy`
7. Set start command: `npm start`
8. Railway auto-deploys on every push to main

### Environment variables on Railway
Same as local setup — add all 8 variables from `.env.example`.
`NODE_ENV` should be `production`.

## Live demo

- API: https://YOUR-RAILWAY-URL
- Swagger: https://YOUR-RAILWAY-URL/api-docs
- Evaluation: https://YOUR-RAILWAY-URL/api/evaluation