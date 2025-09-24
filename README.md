# WC26 Ticket Swap — Starter

This is a Next.js 14 + Prisma + Postgres project with:
- Anonymous users (cookie)
- Create "Have/Want" listings
- Direct swap matching
- Stripe checkout for a matchmaking fee
- Admin page with Featured toggle
- Success page to collect FIFA confirmation IDs

## Quick Deploy (high-level)
1. Create a Postgres DB (Neon/Supabase) and copy the `DATABASE_URL`.
2. Create a Stripe account (test mode), get API keys + webhook secret.
3. Push this repo to GitHub, then "Import Project" in Vercel.
4. In Vercel → Project Settings → Environment Variables, set:
   - DATABASE_URL
   - NEXT_PUBLIC_SITE_URL
   - SESSION_COOKIE_NAME=wc_swap_uid
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - ADMIN_PASSWORD
   - MATCHMAKING_FEE_CENTS (e.g., 299)
5. Redeploy. Visit `/admin/login` to toggle Featured listings.
6. Point your domain to Vercel (A record 76.76.21.21; CNAME www → cname.vercel-dns.com).
