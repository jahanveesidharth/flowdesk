# DeskFlow

DeskFlow is a hybrid office booking template for teams that need desk, room, parking, and locker reservations without spreadsheets or back-and-forth messages. Employees can open an interactive office map, reserve resources in minutes, and plan remote or in-office days from one place.

Workplace teams get admin tools for floor plans, booking rules, and utilization analytics, while employees get a fast booking experience that works on desktop and mobile.

## Key Highlights

- Interactive floor map with live desk and room availability states
- Guided booking wizard for date, location, and resource selection
- Weekly planner for hybrid schedules across remote and in-office work
- Admin office builder with drag-and-drop floor plan tools
- Utilization analytics for occupancy trends, peak times, and resource usage

## Features

- Real-time desk and room availability
- Booking support across desks, rooms, parking, and lockers
- Weekly hybrid planner
- QR-based check-in flow
- Waitlist and notification support
- Drag-and-drop floor designer
- Rule-driven booking controls
- Occupancy and utilization dashboards

## Who This Is For

- Office managers coordinating hybrid workspace usage
- Workplace and HR teams supporting in-office planning
- Facilities leads tracking utilization and capacity
- Team leads aligning in-office collaboration days

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase Auth, Database, Realtime, and Edge Functions

## Local Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5174
```

Start the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a free Supabase project.
2. Open Supabase Dashboard > SQL Editor.
3. Run these migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`
4. Copy your Project URL and anon public key from Project Settings > API.
5. Add them to `.env.local`.
6. In Authentication > URL Configuration, set your local site URL to `http://localhost:5174`.

For production, also add your deployed app URL to Supabase redirect URLs.

## GitHub Setup

Initialize and push this folder:

```bash
git init
git add .
git commit -m "Initial DeskFlow setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

The `.env.local` file is ignored by Git, so your Supabase keys stay local.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

See [SETUP.md](./SETUP.md) for the longer production setup guide.
