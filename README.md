# HeartSync

> **Kisi se baat karni hai? Bina judge kiye sunne wale.**
> Talk to a verified big bro or big sis — anonymously, safely, in your language.

HeartSync is a peer-support platform for adults in India. Seekers chat anonymously with trained, verified
listeners ("big bros" and "big sisters"). It is **peer support, not therapy** — listeners never diagnose,
prescribe or present themselves as professionals.

## What's in the app

| Area | What it does |
| --- | --- |
| **Landing page** | Hero, topic marquee, how it works, trust bento, can/can't, live listener preview, pricing, FAQ, crisis band |
| **Accounts** | Email + password sign-up with a hard **18+ date-of-birth check**, nickname-only identity, signed HTTP-only session cookies |
| **Listener directory** | Filter by topic, language and who's online. Presence comes from a heartbeat, so closed tabs drop offline after 2 minutes |
| **Chat** | Request → listener accepts → timed chat with countdown. Live updates by polling. End, report, rate |
| **Safety engine** | Server-side blocking of phone numbers, emails, handles, links, meet-ups, money requests and romantic/sexual solicitation. Crisis language (English + Hinglish) is **delivered, never blocked**: both people see helplines and the safety team is alerted |
| **Minutes & payments** | First 20-minute chat free. Razorpay packs (₹99 / ₹249 / ₹549). Exactly-once crediting, plus a webhook backup. Automatic refunds for declined/expired requests and for unused minutes when a chat ends early |
| **Listener side** | Application form (ID + police verification consent), dashboard with online switch, live request queue, profile editing, stats |
| **Safety desk (admin)** | Crisis flags, open reports, listener approvals, pause/suspend. Transcripts can be opened **only** for reported or crisis-flagged chats |
| **Legal pages** | Safety & code of conduct, Terms, Privacy (DPDP Act), crisis helplines |

Design: warm Pinterest-style palette, Instrument Serif + Inter, full dark mode, mobile-first.
The effects (aurora background, blur-in text, spotlight cards, marquee, shimmer button) follow patterns
popularised by [React Bits](https://reactbits.dev) and [21st.dev](https://21st.dev). They are written from
scratch in `src/components/effects`, are CSS-first, respect `prefers-reduced-motion`, and still render
correctly with JavaScript turned off.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Prisma 6 ·
SQLite for development / PostgreSQL for production · jose (JWT sessions) · bcryptjs · zod · Vitest.

## Getting started

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET: openssl rand -base64 32
npm run db:push             # create the local SQLite database
npm run db:seed             # optional: demo accounts (see below)
npm run dev                 # http://localhost:3000
```

Demo accounts created by `npm run db:seed` all use the password `demo-password-123`:

- `seeker@heartsync.local`: a seeker with 60 minutes
- `aarav@` / `meera@` / `kabir@` / `zoya@heartsync.local`: listeners. Log in and keep the dashboard open to appear online
- `admin@heartsync.local`: safety desk

To try a full chat, open two browsers: log in as a listener in one and a seeker in the other.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint, `tsc --noEmit`, Vitest unit tests (safety filter, refunds, age, timers) |
| `npm run db:push` · `npm run db:seed` | Sync the schema, seed demo data (never run the seed in production) |

## Environment

See `.env.example`. Required in production: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAILS`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_GRIEVANCE_OFFICER`.
Payments switch on once `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are set.
Until then the top-up buttons explain that payments aren't live, and the free chat still works.

## Deploying (Vercel + Postgres)

1. Create a Postgres database (Neon, Supabase, Railway…).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set the environment variables above in Vercel, then run `npx prisma db push` against the production database.
4. In the Razorpay dashboard, add a webhook to `https://<your-domain>/api/payments/webhook` for `payment.captured`.

## Project structure

```
prisma/              schema + dev seed
src/actions/         server actions (auth, chat, listener, admin)
src/app/             routes: pages + API (chat polling, messages, payments, webhook)
src/components/      ui primitives, effects, landing sections, chat, listener, admin
src/lib/             chat-service (state machine + refunds), safety filter, auth, razorpay, rules
tests/               unit tests
```

The chat lifecycle (`src/lib/chat-service.ts`) uses conditional updates, so racing requests can never
double-charge or double-refund. Pure rules live in `src/lib/session-rules.ts` and are unit-tested.

## Before launch — the product makes these promises, so they must be true

- [ ] **Legal review** of Terms, Privacy and the peer-support positioning by an Indian lawyer
- [ ] A real **listener verification process** (DigiLocker ID, police verification) and the ~15-hour training the site describes. Approve listeners in the safety desk only after both are complete
- [ ] A **psychologist advisor** for training and escalations, plus a written crisis protocol with an on-call rota
- [ ] A named **Grievance Officer** and support email (IT Rules, 2021), set through the env vars above
- [ ] Razorpay KYC, GST registration and a listener payout process (listeners earn per minute; payouts are not automated yet)
- [ ] Postgres in production, plus a shared store (Redis/Upstash) for rate limiting if you run more than one server instance
- [ ] Email notifications and password reset (not built yet)
- [ ] At scale, swap chat polling for WebSockets or a hosted realtime service

## Helplines shown in the product

Tele-MANAS **14416** (24×7, free) · Emergency **112** · Women **181** · Childline **1098**
