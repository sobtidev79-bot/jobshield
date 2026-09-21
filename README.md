# JobShield — Check before you apply.

A job scam risk analyzer built as a college mini-project. JobShield looks at a
job posting (description, link, company name, recruiter email) and surfaces
common scam-related warning signs — with a transparent, explainable,
rule-based scoring engine. It never claims a job is definitely fake; it
reports risk signals and evidence, and tells you what to verify yourself.

## Project structure

```
jobshield/
├── frontend/        React + Vite + TypeScript + Tailwind CSS
├── backend/         Node.js + Express API
│   └── src/
│       ├── risk-engine/   The rule-based scoring engine (the core logic)
│       ├── routes/        API route handlers
│       └── db/            SQLite persistence + demo data seeding
└── database/        SQLite database file lives here (created automatically)
```

## Running it locally

You'll need Node.js 18+ installed.

**1. Start the backend** (runs on http://localhost:4000):

```bash
cd backend
npm install
npm run dev
```

On first run it seeds two demo analyses (one realistic internship, one
suspicious "work from home" posting) so History isn't empty.

**2. Start the frontend** (runs on http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api/*` requests to the backend
automatically (see `vite.config.ts`), so just open http://localhost:5173.

## How the risk engine works

`backend/src/risk-engine/rules.js` defines a set of independent rule
functions. Each rule inspects the submitted job data and, if triggered,
returns a signal with:

- `title` — short human-readable name
- `severity` — `high` / `medium` / `low` / `info`
- `scoreContribution` — how many points it adds (0–100 scale)
- `explanation` — plain-language reasoning
- `evidence` — the specific text/data that triggered the flag

`backend/src/risk-engine/index.js` runs every rule, sums the scores, clamps
to 0–100, and maps the total to a risk level:

| Score  | Level        |
|--------|--------------|
| 0–24   | Low Risk     |
| 25–49  | Moderate Risk|
| 50–74  | High Risk    |
| 75–100 | Very High Risk |

Adding a new signal means writing one function and adding it to the `RULES`
array — no changes needed elsewhere.

**Not implemented on purpose:** JobShield does not scrape arbitrary URLs or
claim to verify a job against a company's real careers page. That's flagged
as an informational item the user should check themselves, since
uncontrolled scraping of user-submitted URLs is a security risk.

## API

- `POST /api/analyze` — body: `{ job_description?, job_url?, company_name?, recruiter_email? }`
- `GET /api/history` — list of past analyses (most recent first)
- `GET /api/analysis/:id` — full detail for one analysis

## What this project deliberately avoids

- No large-scale scraping of arbitrary user-submitted URLs
- No claims of a trained ML model where none exists (the architecture is
  ready for a future TF-IDF + logistic regression classifier, but the MVP
  is fully rule-based and says so)
- No definitive "this is a scam" language — always framed as risk signals
  to verify

## Privacy

The app does not ask for or store passwords, government ID numbers, banking
details, or identity documents. Only the job posting details and resulting
analysis are stored, so a user can revisit their history.
