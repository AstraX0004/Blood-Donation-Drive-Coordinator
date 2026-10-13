# Blood Donation Drive Coordinator 🩸

Single digital platform for donor management, camp organization, appointment tracking, dashboard, reports/Excel export, and **Gemini AI** campaign planning.

## Quick start (beginner-friendly)

```bash
cd blood-donation-coordinator
npm install
cp .env.example .env   # optional
npm run dev            # http://localhost:3000
```

No database setup needed — data persists in the browser (localStorage) with demo seed data.

## Data storage

All donors, camps, appointments and accounts are stored in the browser via **localStorage** — no database, no backend setup, no network calls. Data persists across refreshes on the same browser/device.

- Store key: `bddc-store-v1` (donors, camps, appointments)
- Auth keys: `bddc-session`, `bddc-users`
- Use **Reset demo data** on the Reports page to restore the seed data

## Enable Gemini AI (optional)

1. Get a key from Google AI Studio
2. Set `GEMINI_API_KEY=` in `.env`
3. Without a key, `/api/ai` uses a built-in data-driven planner (gap analysis, fill rates, outreach templates)

## Deploy to Vercel

```bash
npm run build
# push to GitHub → Import in vercel.com → Add env vars → Deploy
```

## Features

- **Dashboard:** donor stats, upcoming camps, registration progress bars, rare-group gap alerts
- **Donors:** register, search/filter, availability toggle, Excel export
- **Camps:** create, capacity, status (upcoming/ongoing/completed/cancelled), fill tracking
- **Appointments:** registered → confirmed → attended / cancelled / no-show, capacity + duplicate guards
- **Reports:** status counts, camp fill rates, one-click Excel (.xlsx) downloads incl. full multi-sheet workbook
- **AI Planner:** campaign plans, data summaries, participation suggestions

⚕️ **Medical safety:** the app never determines donor medical eligibility; final decisions must be made by qualified healthcare personnel.
