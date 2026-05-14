# Panini 2026 Tracker

Track your FIFA World Cup 2026 sticker collection. Add friends, compare progress, and climb the leaderboard.

## Features

- **Your album** — mark 992 stickers as collected across 48 teams + intro/museum/Coca-Cola sections
- **Friends** — add friends by username, view each other's albums (read-only)
- **Leaderboard** — global rankings and a friends-only leaderboard
- **Real-time** — collection updates sync live across devices

---

## Setup in 4 steps

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, give it a name (e.g. "panini-tracker"), pick a region close to you
3. Wait ~2 minutes for the project to spin up
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (long string starting with `eyJ...`)

### Step 2 — Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents into the editor
5. Click **Run** — you should see "Success. No rows returned"

That creates:
- `profiles` table (users)
- `collections` table (stickers owned)
- `friendships` table (friend connections)
- `leaderboard_view` (live rankings)
- All Row Level Security policies
- Trigger to auto-create profile on signup

### Step 3 — Configure environment variables

1. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Vercel gives you a free URL like `panini-tracker.vercel.app`. Share that link with friends.

> **Custom domain**: In Vercel → your project → Settings → Domains, you can add a custom domain for free.

---

## Optional: Disable email confirmation (for easy testing)

By default Supabase requires email confirmation before users can log in. During development, you can turn this off:

1. In Supabase → **Authentication → Providers → Email**
2. Toggle **Confirm email** off

Turn it back on before sharing publicly.

---

## Adding features later

The codebase is structured so you can extend it easily:

- **Duplicate tracking** — add a `duplicates` table with the same schema as `collections`
- **Trade requests** — add a `trades` table with `from_user`, `to_user`, `offered_sticker`, `requested_sticker`
- **Team completion badges** — query `collections` grouped by team code and check if all 20 are present
- **Push notifications** — Supabase Edge Functions + a service like Resend for email notifications when a friend completes a team

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Backend / DB | Supabase (Postgres + Auth + Realtime) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
