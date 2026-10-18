# TiffinGhar — Homemade Tiffin Marketplace Platform

TiffinGhar is a production-grade, two-sided marketplace connecting homemade Tiffin Partners (home chefs & local kitchens) with Customers seeking authentic, fresh, everyday meals (*"Ghar jaisa Khana ♡"*).

Built with a **3D / Spatial UI + Biomorphic design theme**, warm organic aesthetics, **zero ORMs** (direct `mysql2/promise` connection pool with parameterized queries on local WAMP MySQL), and zero hardcoded content.

---

## 🌟 Key Architecture Highlights

- **Zero Hardcoding**: All branding, plans (₹49/month), free image limit (3), subscription duration (30 days), login popup delay (15s), expiration reminders (3 days), FAQs, hero content, and contact channels are dynamically loaded from MySQL and `.env`.
- **Pure SQL & WAMP MySQL Engine**: Powered directly by `mysql2/promise` with connection pooling. Absolutely no Prisma or third-party ORMs. Migrations are executed in sequence via plain SQL files tracked by `schema_migrations`.
- **Automatic Subscription & Expiry Sweeper**: Single source of truth formula (`NOW() < end_date`) evaluated on every read. On expiration: extra images beyond 3 are automatically hidden (preserved in DB), recommended badge and priority listing are removed without any admin intervention.
- **Strict Data Isolation & Security**: Unauthenticated visitors are blocked by route middleware and API layers from retrieving partner contact numbers (tel: / WhatsApp). Contact attempts are logged as leads with audit records.
- **360-Degree Linked Admin Intelligence**: Admin can click any `CUS-xxxxxx`, `TIF-xxxxxx`, or `PAY-xxxxxx` to inspect complete history, including **EXACTLY which tiffin partner kitchens were viewed by each customer** with counts and timestamps.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.18+ or v20+)
- **WAMP Server** running with MySQL on port `3306` (ensure the WAMP tray icon is green)

### 2. Configure Environment (`.env`)
Both `.env` and `.env.example` are provided in the project root:
```env
# Database (WAMP MySQL Local)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tiffinghar

# Platform Brand & App
NEXT_PUBLIC_BRAND_NAME=TiffinGhar
BRAND_NAME=TiffinGhar
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Plan & Limits
NEXT_PUBLIC_PREMIUM_PRICE=49
NEXT_PUBLIC_FREE_IMAGE_LIMIT=3
SUBSCRIPTION_DURATION_DAYS=30
NEXT_PUBLIC_LOGIN_POPUP_DELAY_SECONDS=15
REMINDER_DAYS_BEFORE_EXPIRY=3

# Seeded Admin Credentials
ADMIN_EMAIL=nisant746181@mail.com
ADMIN_PASSWORD=nishant123

# Security & Secrets
JWT_SECRET=tiffinghar_super_secure_jwt_secret_token_2026_xyz
COOKIE_SECRET=tiffinghar_secure_cookie_secret_key_2026

# Razorpay Test Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_tiffinghar_demo_key
RAZORPAY_KEY_SECRET=rzp_test_tiffinghar_demo_secret

# Support Contacts
SUPPORT_EMAIL=support@tiffinghar.local
SUPPORT_PHONE=+91 98765 43210
SUPPORT_WHATSAPP=+91 98765 43210
```

### 3. Setup Database in One Command
```bash
# 1. Install dependencies
npm install

# 2. Automatically create database, run all 6 migrations, and seed realistic marketplace data
npm run db:setup
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Accounts for Testing

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `nisant746181@mail.com` | `nishant123` | Full access to `/admin/*`, 360 views, ranking manager, support desk |
| **Partner (Active Premium)** | `chef.anita@tiffinghar.local` | `partner123` | `/partner/dashboard`, unlimited dishes & images, Recommended badge |
| **Partner (Free Tier)** | `contact@desikhana.local` | `partner123` | `/partner/dashboard`, strictly capped at 3 visible images |
| **Customer** | `aarav.patel@gmail.com` | `customer123` | `/customer/dashboard`, view partners, write reviews, raise tickets |

---

## 🛠 Database Management CLI Commands

| Command | Action |
| :--- | :--- |
| `npm run db:create` | Connects to WAMP MySQL and creates database `tiffinghar` if it does not exist |
| `npm run db:migrate` | Runs all pending SQL migration files in order from `/database/migrations` |
| `npm run db:seed` | Seeds 12+ partners, 48 products, 20 customers, reviews, subscriptions, FAQs |
| `npm run db:reset` | Drops, recreates, migrates, and re-seeds database (dev environment only) |
| `npm run db:setup` | Complete pipeline: create &rarr; migrate &rarr; seed in a single command |

---

## 🧪 Automated Test Suites

All 5 project phases include standalone verification scripts:
```bash
# Phase 2: Brute-force lockout and session authentication tests
npx tsx scripts/test-phase2-auth.ts
npx tsx scripts/test-lockout.ts

# Phase 3: Partner products, image limits, and customer reviews
npx tsx scripts/test-phase3-portal.ts

# Phase 4: Razorpay order creation, signature verification, webhook idempotency, and expiry sweeper
npx tsx scripts/test-phase4-subscription.ts

# Phase 5: Admin telemetry, customer 360-degree exact partner tracking, ranking, and support desk
npx tsx scripts/test-phase5-admin.ts
```

---

## 🔒 Role-Based Access Control (RBAC) Matrix

| Path / Resource | Guest / Public | CUSTOMER | PARTNER | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| `/` (Homepage, About, Pricing, Contact) | ✅ | ✅ | ✅ | ✅ |
| `/partners` (Directory cards without contacts) | ✅ | ✅ | ✅ | ✅ |
| `/partner/[id]` (Full partner page & contacts) | ❌ *(Opens Auth Modal / 401)* | ✅ | ✅ | ✅ |
| `/customer/*` (Dashboard, Favorites, My Reviews) | ❌ | ✅ | ❌ | ✅ |
| `/partner/*` (Meals, Profile, Image Limit, Subscription) | ❌ | ❌ | ✅ | ✅ |
| `/admin/*` (360 Views, Ranking, Ledger, Support, Audits) | ❌ | ❌ | ❌ | ✅ |

---

## 🔌 Architecture & Extensibility

### 1. Swapping File Storage Layer (`/src/lib/storage.ts`)
The project utilizes an abstract storage interface `IStorageProvider`:
- **Current Driver**: `LocalStorageProvider` saves uploaded images locally to `/public/uploads/` with safe UUID renaming and MIME type validation.
- **To switch to AWS S3 or Cloudinary**: Implement `IStorageProvider` with `.upload(file)` and `.delete(key)` and instantiate it in `src/lib/storage.ts` based on `STORAGE_DRIVER=s3|cloudinary`.

### 2. Swapping Payment Gateway
Payment workflows are decoupled into `src/lib/payment.ts`:
- **Current Gateway**: Razorpay test mode with server-side order generation, SHA-256 HMAC signature validation, and idempotent webhook handling.
- **To switch to Cashfree or Stripe**: Replace the checkout trigger in `/api/payments/create-order` and signature verification in `/api/payments/verify`.

---

## 📋 Comprehensive API Route Catalog

### Authentication
- `POST /api/auth/register` — Customer & Partner registration with Zod validation
- `POST /api/auth/login` — Account authentication with 5-attempt brute force lockout
- `GET /api/auth/me` — Current authenticated session payload
- `POST /api/auth/logout` — Destroys httpOnly session cookies
- `POST /api/auth/forgot-password` — Issues secure 1-hour reset token
- `POST /api/auth/reset-password` — Validates token and updates password

### Public & Engagement
- `GET /api/settings` — Live brand configurations, platform stats, FAQs, testimonials
- `POST /api/contact` — Public inquiry creating support ticket `TKT-xxxxxx`
- `GET /api/partners/[id]` — Protected partner detail endpoint (returns 401 to unauthenticated visitors)
- `POST /api/partners/[id]/log-click` — Logs direct call or WhatsApp inquiry lead
- `POST /api/partners/[id]/review` — Customer review submission or update (1 per kitchen)

### Partner Dashboard
- `GET /api/partner/products` — Partner meals catalog
- `POST /api/partner/products` — Meal creation with strict 3-image limit check on free plan
- `PATCH /api/partner/products/[id]` — Edit dish or toggle availability
- `DELETE /api/partner/products/[id]` — Dish removal
- `GET /api/partner/profile` — Kitchen details, delivery logistics, FSSAI
- `PUT /api/partner/profile` — Profile updates
- `GET /api/partner/reviews` — Reviews received with chef reply options
- `POST /api/partner/reviews/[id]/reply` — Submit chef reply
- `GET /api/partner/payments` — Transaction ledger

### Subscriptions & Payments
- `POST /api/payments/create-order` — Generates Razorpay order for ₹49
- `POST /api/payments/verify` — Verifies signature and activates subscription (+30 days)
- `POST /api/payments/webhook` — Idempotent webhook receiver
- `GET /api/cron/subscription-sync` — Automatic cron sweeper marking expired plans

### Admin Panel
- `GET /api/admin/stats` — Executive KPI metrics and revenue overview
- `GET /api/admin/customers` — Searchable customer directory
- `GET /api/admin/customers/[id]` — Customer 360 view with **exact tiffin partners viewed**, visit counts, and timestamps
- `PATCH /api/admin/customers/[id]` — Suspend / reactivate customer
- `GET /api/admin/partners` — Partner kitchens directory
- `GET /api/admin/partners/[id]` — Partner 360 view with meals, subscriptions, logs, and reviews
- `POST /api/admin/partners/[id]/actions` — Suspend, verify, pin, or adjust priority rank
- `GET /api/admin/website` — Sequence ordering, site settings, FAQs, testimonials
- `POST /api/admin/website` — Save ordering, update site settings, manage FAQs
- `GET /api/admin/payments` — Read-only automatic payments log with CSV export (`format=csv`)
- `GET /api/admin/audit-logs` — Unified activity audit trail
- `GET /api/support/tickets` — Helpdesk tickets directory
- `GET /api/support/tickets/[id]/messages` — Support conversation with read receipts
- `POST /api/support/tickets/[id]/messages` — Support reply
- `PATCH /api/support/tickets/[id]/status` — Update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)

---

## 🛡 Security & Compliance Standards
- **Parameterized SQL**: All database operations use `?` placeholders with connection pooling.
- **Cryptographic Password Hashing**: Passwords hashed using `bcryptjs` with salt rounds.
- **HTTP-Only Cookies**: JWT stored in `httpOnly`, `sameSite=lax`, and `secure` cookies.
- **Brute-Force Lockout**: Automatically locks user accounts for 15 minutes after 5 failed attempts.
- **XSS & Injection Protection**: Strict input validation using Zod schemas on both client and server.
- **Security Headers**: Production headers applied (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`).
