# DeskFlow — Production Setup Guide
## Zero paid API keys. Free forever for 10 employees.

---

## The Complete Free Stack

| Service | Purpose | Free Tier Limit | Paid Upgrade? |
|---|---|---|---|
| **Supabase** | Database + Auth + Realtime + Storage | 500 MB DB, 50K MAU, 2 GB storage | $25/mo if ever needed |
| **Vercel** | Hosting (React app) | Unlimited for personal/hobby | $20/mo for teams |
| **Resend** | Booking email notifications | 3,000 emails/month | $20/mo for more |
| **GitHub** | Version control + CI/CD | Unlimited public/private repos | Free |
| **Supabase Auth** | Login, magic links, password reset | Included in free tier | Included |
| **Supabase Realtime** | Live desk availability updates | Included in free tier | Included |
| **Supabase Edge Functions** | Email triggers, auto-release logic | 500K invocations/month | Included |
| **pg_cron** | Auto-release no-shows every 15 min | Included in free tier | Included |

**Total monthly cost for 10 employees: $0**

> For 10 employees you will never hit any free tier limit. Supabase free handles 50,000 MAU.
> Even at 100 employees you stay free on all these services.

---

## Step-by-Step Setup (30 minutes total)

### Step 1 — Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**
   - Name: `deskflow`
   - Database password: (save this somewhere safe)
   - Region: pick closest to your office
3. Wait ~2 minutes for project to be ready

### Step 2 — Run Database Migrations (5 min)

In Supabase Dashboard → **SQL Editor** → **New Query**:

Run these files **in order** (copy-paste each):
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql`

Click **Run** after each one. You should see "Success" each time.

### Step 3 — Configure App Environment (2 min)

1. In Supabase Dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long JWT string)
3. In your project folder:
   ```bash
   cp .env.example .env.local
   ```
4. Edit `.env.local`:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=https://your-vercel-domain.vercel.app
   ```

### Step 4 — Set Up Authentication (3 min)

In Supabase Dashboard → **Authentication** → **Settings**:

1. **Site URL**: `https://your-vercel-domain.vercel.app`
2. **Redirect URLs**: Add `https://your-vercel-domain.vercel.app/dashboard`
3. **Email** section: Enable "Confirm email" (optional for internal tools — you can disable it for faster onboarding)
4. **SMTP Settings** (optional): Supabase provides a free shared SMTP for Auth emails.
   - For custom domain emails, add your own SMTP (Gmail SMTP is free).

### Step 4.1 — Customize Magic Link Email (Optional, 3 min)

In Supabase Dashboard:

1. Go to **Authentication** → **Emails** → **Templates**.
2. Open the **Magic Link** template.
3. Set the subject to:
   ```
   Sign in to DeskFlow
   ```
4. Paste the HTML from `supabase/templates/magic-link.html`.
5. Save the template.

The button in that template uses Supabase's `{{ .ConfirmationURL }}` variable, so the **Sign in to DeskFlow** button is the clickable magic link.

To change who the email appears to come from:

- On Supabase's shared email sender, it may still show a Supabase-managed address such as `noreply@mail.app.supabase.io`.
- For a branded sender like `DeskFlow <hello@yourcompany.com>`, configure **Authentication** → **Emails** → **SMTP settings** with your own SMTP provider or company email domain.

### Step 5 — Create Your First Admin User (2 min)

Option A — Via the app:
1. Run the app: `npm run dev`
2. Go to `/login` → Sign up with your email
3. Then in Supabase SQL Editor, promote yourself to admin:
   ```sql
   update profiles set role = 'admin'
   where email = 'YOUR-EMAIL@company.com';
   ```

Option B — Via Supabase Dashboard:
1. **Authentication** → **Users** → **Add User** → add their email
2. Run the SQL above to set their role

### Step 6 — Invite Your Team (5 min)

For each employee, either:

**Option A — They sign up themselves:**
Share your app URL, they go to `/login` → "Sign up free"

**Option B — Admin invites:**
In Supabase Dashboard → **Authentication** → **Users** → **Invite user**
Enter their work email → they get a magic link

**To set someone as manager/admin:**
```sql
update profiles set role = 'manager'
where email = 'sarah@company.com';
```

### Step 7 — Deploy to Vercel (5 min)

```bash
# Install Vercel CLI (free)
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to your GitHub repo (optional but recommended)
# - Framework: Vite
# - Build command: npm run build
# - Output dir: dist
```

Or go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo → Set environment variables from Step 3.

**Vercel environment variables to set:**
```
VITE_SUPABASE_URL       = https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY  = your-anon-key
VITE_APP_URL            = https://your-app.vercel.app
```

### Step 8 — Set Up Email Notifications (Optional, 5 min)

If you want booking confirmation emails:

1. Sign up at [resend.com](https://resend.com) (free, no credit card)
2. Create an API key
3. In Supabase Dashboard → **Edge Functions** → Deploy the function:
   ```bash
   npx supabase functions deploy send-booking-email --project-ref YOUR_PROJECT_REF
   ```
4. Set secrets:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_your_key
   npx supabase secrets set APP_URL=https://your-app.vercel.app
   ```
5. In Supabase Dashboard → **Database** → **Webhooks** → **Create Webhook**:
   - Table: `bookings`
   - Events: `INSERT`, `UPDATE`
   - URL: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-booking-email`
   - Headers: `{ "Authorization": "Bearer YOUR-ANON-KEY" }`

### Step 9 — Set Up Auto-Release No-Shows (Optional, 2 min)

In Supabase Dashboard → **SQL Editor**:
```sql
-- Enable pg_cron extension (free on Supabase)
create extension if not exists pg_cron;

-- Run auto-release every 15 minutes on weekdays
select cron.schedule(
  'auto-release-no-shows',
  '*/15 * * * 1-5',
  'select auto_release_no_shows()'
);
```

---

## Onboarding Your 10 Employees

Here's the exact sequence:

1. ✅ You (admin) complete Steps 1–7 above (~30 min)
2. ✅ Share your Vercel URL with everyone
3. ✅ Everyone signs up at `/login`
4. ✅ You promote managers in SQL (30 seconds each)
5. ✅ Each person logs in and sees their floor map immediately

**No IT department needed. No servers to manage. No credit card required.**

---

## Keeping Supabase Free Forever

Supabase free tier limits:
- ✅ **50,000 MAU** — you'd need 50,000 monthly active users to exceed this
- ✅ **500 MB database** — 10 employees booking daily = ~1 MB/year
- ✅ **2 GB file storage** — only used if you upload floor plan images
- ✅ **Unlimited API requests**
- ⚠️ **Projects pause after 1 week of inactivity** — to prevent this, upgrade to Pro ($25/mo) or ping the app weekly

**To prevent project pausing (free workaround):**
Use a free uptime monitor (UptimeRobot.com) to ping your Vercel app URL every day.
This counts as activity and keeps your Supabase project active.

---

## API Keys Summary

| Key | Where | Required? | Cost |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → API | ✅ Yes | Free |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → API | ✅ Yes | Free |
| `RESEND_API_KEY` | resend.com → API Keys | ⬜ Optional | Free (3K emails/mo) |

**That's it. 2 required keys, both free.**

You do NOT need:
- ❌ Stripe or payment keys
- ❌ SendGrid/Mailgun (Supabase Auth handles auth emails)
- ❌ Pusher/Ably (Supabase Realtime handles live updates)
- ❌ Firebase/AWS (Supabase replaces all of this)
- ❌ Google Maps API (floor maps are built-in grid system)
- ❌ Any AI/ML API

---

## Upgrading Later (When You Grow)

If you grow beyond 10 employees or need more features:

| Need | Solution | Cost |
|---|---|---|
| Custom domain email | Add SMTP in Supabase Auth settings | Free (Gmail SMTP) |
| More than 3K emails/month | Resend paid tier | $20/mo |
| Prevent project pausing | Supabase Pro | $25/mo |
| Team collaboration on Vercel | Vercel Pro | $20/mo |
| SSO / SAML login | Supabase Enterprise | Custom |
| QR code scanning | Browser native (no API needed) | Free |
| Mobile push notifications | Web Push API (browser native) | Free |

---

## Generating Up-to-Date Supabase Types

After making schema changes, regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/lib/database.types.ts
```

---

## Troubleshooting

**"Failed to fetch" errors in the app:**
→ Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local

**Users can't log in after sign-up:**
→ Check Supabase Dashboard → Authentication → Email → "Confirm email" might be enabled. Disable it for internal tools.

**Double-booking error:**
→ This is by design — the `no_double_booking` constraint in the DB prevents it.

**App shows demo data instead of real data:**
→ VITE_SUPABASE_URL still has "your-project-ref" placeholder. Update .env.local.

**RLS blocking queries:**
→ Check you're logged in. All tables require authentication. In SQL Editor you can test with `set role authenticated`.
