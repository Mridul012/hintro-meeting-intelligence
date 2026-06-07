# Hintro Meeting Intelligence API

REST API for managing meeting transcripts with AI-powered analysis. 
Upload a transcript, run analysis to extract action items and decisions 
(each cited back to a specific transcript timestamp), and get automated 
email reminders for overdue tasks.

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 + TypeScript |
| Framework | Express |
| Database | MySQL 8 via Prisma 5 |
| AI | Groq API — Llama 3.3 70B |
| Validation | Zod 4 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Resend |
| Scheduler | node-cron |
| Docs | Swagger UI (OpenAPI 3.0) |

---

## Local setup

```bash
git clone https://github.com/Mridul012/hintro-meeting-intelligence.git
cd hintro-meeting-intelligence
npm install
cp .env.example .env
# fill in .env with your values
```

Create the MySQL database:

```bash
mysql -u root -p -e "CREATE DATABASE hintro_db;"
```

MySQL 8 uses `caching_sha2_password` by default which Prisma 5 does not support.
Fix it before running migrations:

```bash
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';"
```

Run migrations and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

---

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | `mysql://root:pass@localhost:3306/hintro_db` |
| `JWT_SECRET` | minimum 32 characters |
| `JWT_EXPIRES_IN` | e.g. `1h` |
| `PORT` | default `3000` |
| `NODE_ENV` | `development` / `production` / `test` |
| `GROQ_API_KEY` | from [console.groq.com](https://console.groq.com) |
| `RESEND_API_KEY` | from [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | use `onboarding@resend.dev` for testing |

---

## API docs

**Production:**

- Swagger UI: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app/api-docs`
- Health: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app/health`
- Evaluation: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app/api/evaluation`

**Local:**

- Swagger UI: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`

---

## Quick examples

**Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns `{ token }` — use this as `Authorization: Bearer <token>` on all other requests.

**Create a meeting**

```http
POST /api/meetings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Sprint Planning",
  "participants": ["alice@example.com", "bob@example.com"],
  "meetingDate": "2026-05-20T10:00:00Z",
  "transcript": [
    { "timestamp": "00:10", "speaker": "John", "text": "We should launch next Friday." },
    { "timestamp": "00:20", "speaker": "Alice", "text": "I'll prepare the release notes." },
    { "timestamp": "00:30", "speaker": "Bob", "text": "I'll handle the deployment pipeline." }
  ]
}
```

**Run AI analysis**

```http
POST /api/meetings/:id/analyze
Authorization: Bearer <token>
```

Returns `summary`, `actionItems`, `decisions`, and `followUpSuggestions`.
Every item includes a `citations` array referencing the exact transcript timestamp
it was derived from. Re-running this endpoint replaces the previous analysis.

**Action items**

```http
POST  /api/action-items
GET   /api/action-items?status=PENDING&assignee=Alice&meetingId=xxx
PATCH /api/action-items/:id/status
GET   /api/action-items/overdue
```

---

## Reminder scheduler

A cron job runs every 15 minutes. For each overdue action item it:

1. Checks if a reminder was already sent in the last 24 hours — skips if yes
2. Sends an email via Resend to the first participant of that meeting
3. Records the attempt in `ReminderHistory` (success or failure)

In development, an initial pass runs 5 seconds after startup so you
don't have to wait 15 minutes to test it.

---

## Tests

```bash
npm test
```

10 unit tests covering:

- Citation grounding validation (4 tests)
- Response envelope formatting (2 tests)
- Overdue detection logic (4 tests)

---

## Deployment

### Railway

1. Push repo to GitHub (must be public)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add MySQL plugin: New → Database → MySQL
4. Copy `DATABASE_URL` from the MySQL service Variables tab
5. Add all environment variables in your app service Variables tab
6. Set build command:
   `npm run build && npx prisma generate && npx prisma migrate deploy`
7. Set start command: `npm start`
8. Railway auto-deploys on every push to main

`NODE_ENV` should be set to `production` on Railway.

---

## Live demo

- API: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app`
- Swagger: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app/api-docs`
- Evaluation: `https://hintro-meeting-intelligence-production-d1bd.up.railway.app/api/evaluation`
