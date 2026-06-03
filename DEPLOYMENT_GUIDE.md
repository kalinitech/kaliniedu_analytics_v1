# KalinEdu Analytics — Full Deployment Guide

## Overview
KalinEdu Analytics is a zero-prompt school academic analytics platform for Kenyan schools. Teachers upload Excel marksheets and instantly receive fully calculated grades, rankings, class analytics, and downloadable reports.

**Tech Stack:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Paystack + xlsx (SheetJS)

**Brand:** KALINITECH SYSTEMS | kalinimedia001@gmail.com

---

## Step 1: Create a Supabase Project (FREE)

1. Go to https://supabase.com and sign up / log in
2. Click "New Project"
3. Fill in:
   - Name: `kaliniedu-analytics`
   - Database Password: (save this!)
   - Region: Choose closest to Kenya (e.g., Europe West or Africa South)
4. Wait for project to provision (~2 minutes)
5. Go to Project Settings → API → copy the following:
   - `Project URL` (e.g., `https://xxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (click "Reveal" — keep this SECRET!)

---

## Step 2: Run Database Migrations

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the ENTIRE contents of `supabase/migrations.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify: Go to Table Editor — you should see these tables:
   - `plans` (3 rows: Free, Premium, Enterprise)
   - `grading_systems` (2 rows: CBC, KCSE)
   - `schools`, `users`, `subscriptions`, `uploads`

---

## Step 3: Create a Paystack Account (FREE)

1. Go to https://paystack.com and click "Start for free"
2. Select **Kenya** as your country
3. Business name: "KALINITECH SYSTEMS"
4. Complete KYC verification (business registration or personal ID)
5. Once approved, go to **Settings → API Keys & Webhooks**
6. Copy:
   - Public Key (starts with `pk_test_` or `pk_live_`)
   - Secret Key (starts with `sk_test_` or `sk_live_`)
7. Go to **Settings → Webhooks** and add:
   - URL: `https://your-vercel-app.vercel.app/api/paystack/webhook`
   - Events: Select all (charge.success, subscription.create, subscription.disable)
8. Ensure **M-Pesa** is enabled under Settings → Payment Channels

---

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Fill in your actual values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Install & Run Locally

```bash
# Navigate to project directory
cd kaliniedu-analytics

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 6: Seed Default Data

Visit http://localhost:3000/api/seed in your browser to populate:
- Default grading systems (CBC + KCSE)
- Default pricing plans (Free / Premium / Enterprise)
- Admin user record

---

## Step 7: Deploy to Vercel (FREE)

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
vercel env add PAYSTACK_SECRET_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Redeploy with env vars
vercel --prod
```

### Option B: Via GitHub + Vercel Dashboard
1. Push this project to GitHub
2. Go to https://vercel.com and click "Import Project"
3. Select your GitHub repo
4. Add all 6 environment variables in the Vercel dashboard
5. Click Deploy

---

## Step 8: Configure Paystack Webhook (Production)

After deployment, update your Paystack webhook URL to:
```
https://your-app-name.vercel.app/api/paystack/webhook
```

---

## Step 9: Go Live Checklist

- [ ] Supabase project created and migrations run
- [ ] Paystack account verified (live mode enabled)
- [ ] All environment variables set in Vercel
- [ ] Webhook URL configured in Paystack
- [ ] M-Pesa payment channel enabled in Paystack
- [ ] Test transaction completed successfully
- [ ] Admin panel accessible at /admin
- [ ] Default plans and grading systems seeded
- [ ] Upload flow working (Excel → results)
- [ ] Pricing page showing all 3 plans
- [ ] Subscribe modal collecting name/school/email

---

## Admin Panel Access

Navigate to `/admin` to access the admin panel. The admin user is:
- **Email:** kalinimedia001@gmail.com

### Admin Features:
1. **Dashboard** (`/admin`) — Analytics: total uploads, revenue, teachers, schools + charts
2. **Plans Management** (`/admin/plans`) — Full CRUD for pricing plans with all features
3. **Grading Systems** (`/admin/grading`) — Full CRUD for grading systems (CBC, KCSE, custom)

### Creating Custom Plans:
1. Go to `/admin/plans`
2. Click "Add Plan"
3. Fill in all fields:
   - Name, Description, Price (KES), Duration (months)
   - Max uploads/month, Max students/upload, Max file size (MB)
   - Toggle: PDF Report, Excel Report, Advanced Analytics, School Branding, Priority Support
4. Click Save

### Creating Custom Grading Systems:
1. Go to `/admin/grading`
2. Click "Add Grading System"
3. Enter name and description
4. Add thresholds (min score, max score, grade, points)
5. Set as default if desired
6. Click Save

---

## Pricing Plans (Default)

| Feature | Free | Premium (KES 1,000/mo) | Enterprise (KES 5,000/mo) |
|---------|------|----------------------|---------------------------|
| Uploads/Month | 5 | Unlimited | Unlimited |
| Max Students/File | 50 | 500 | Unlimited |
| Max File Size | 5 MB | 20 MB | 50 MB |
| Excel Report | ✅ | ✅ | ✅ |
| PDF Report | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| School Branding | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

---

## Paystack Transaction Fees (Kenya)

| Payment Method | Fee |
|---------------|-----|
| M-Pesa (STK Push) | 1.5% |
| Visa/Mastercard (Local) | 2.9% |
| International Cards | 3.8% |

---

## Monthly Operating Costs

| Service | Cost |
|---------|------|
| Vercel (Free Tier) | KES 0 |
| Supabase (Free Tier) | KES 0 |
| Paystack | 1.5% per M-Pesa transaction |
| Domain Name | ~KES 1,500/year |
| **Total Monthly** | **KES 0–125** |

---

## Support

- WhatsApp: +254 790 493 120
- Email: kalinimedia001@gmail.com
- Website: https://kaliniedu-analytics.vercel.app

---

*Built by KALINITECH SYSTEMS — Zero Cost. Maximum Impact.*
