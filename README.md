# You Matter — Therapy Platform

A full-stack mental health platform connecting patients with licensed therapists. Patients can browse clinicians, book sessions, and message their therapist. Clinicians manage their schedule, sessions, and profile. Admins review therapist applications and manage the platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Turso (LibSQL / SQLite-compatible) |
| Auth | Custom JWT via `jose` + httpOnly cookies |
| Payments | Stripe + Stripe Connect |
| Email | SendGrid |
| File Storage | AWS S3 |
| Video Sessions | Jitsi Meet |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account (or use the local SQLite fallback for development)
- A [Stripe](https://stripe.com) account with Connect enabled
- A [SendGrid](https://sendgrid.com) account
- An AWS S3 bucket (for therapist document uploads)

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd youmatter
npm install --legacy-peer-deps
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# ── Auth ──────────────────────────────────────────────────
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your_strong_secret_here

# ── Database ──────────────────────────────────────────────
# Leave blank to use a local SQLite file (youmatter.db) for development.
# For production, set both values from your Turso dashboard.
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# ── Stripe ────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Email (SendGrid) ──────────────────────────────────────
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=hello@yourdomain.com

# ── File Uploads (AWS S3) ─────────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# ── Cron (protects the email reminder endpoint) ───────────
CRON_SECRET=any_random_string
```

> **Minimum for local dev:** Only `JWT_SECRET` is strictly required. Without Stripe, payments will be unavailable. Without SendGrid, emails won't send but the app will still run.

### 3. Set up the database

**Option A — Local SQLite (zero config, recommended for dev):**

Leave `TURSO_DATABASE_URL` blank. The app will use `youmatter.db` in the project root. Apply the schema once:

```bash
sqlite3 youmatter.db < lib/db/schema-youmatter.sql
```

**Option B — Turso cloud (recommended for production):**

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create a database
turso db create youmatter

# Get your connection URL and auth token
turso db show youmatter --url
turso db tokens create youmatter

# Apply the schema
turso db shell youmatter < lib/db/schema-youmatter.sql
```

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `.env.local` with the values above.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Creating Your First Admin

There is no signup flow for admins — create the first one directly in the database:

```bash
# Generate a bcrypt hash for the admin password
node -e "const b = require('bcryptjs'); b.hash('yourpassword', 10).then(console.log)"
```

Then run these SQL statements (replace values as needed):

```sql
INSERT INTO users (email, password_hash, role, is_verified, is_active)
VALUES ('admin@yourdomain.com', '<bcrypt_hash_from_above>', 'admin', 1, 1);

INSERT INTO admins (user_id, full_name)
VALUES (last_insert_rowid(), 'Admin Name');
```

Log in at `/login` with those credentials.

---

## User Roles

| Role | Entry point | Description |
|---|---|---|
| `patient` | `/signup` → patient | Browse therapists, book sessions, message clinicians |
| `therapist` | `/clinician/signup` | Set availability, manage sessions, receive payments |
| `admin` | `/login` | Approve therapists, manage users, review testimonials |

> Therapists must be approved by an admin before they appear to patients.

---

## Key Routes

```
/                          Landing page
/patient                   Patient dashboard (auth required)
/patient/find-therapist    Browse all therapists (public)
/patient/clinician/[id]    Therapist public profile + booking prompt
/patient/book-session      Book a session (auth required)
/patient/sessions          View booked sessions
/patient/messages          Patient messaging

/clinician                 Clinician dashboard (auth + approved)
/clinician/signup          Therapist registration
/clinician/sessions        Session management + clinical notes
/clinician/schedule        Set weekly availability
/clinician/messages        Clinician messaging
/clinician/profile         Edit clinician profile + Stripe Connect

/admin                     Admin dashboard
/admin/therapist           Therapist approval queue
/admin/users               User management
/admin/testimonials        Testimonial moderation

/donate                    Donation page
/meeting                   Jitsi video session room
/api-docs                  Swagger API documentation
```

---

## Stripe Setup

### Test payments locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local`

### Therapist payouts (Stripe Connect)

Therapists link their Stripe account from `/clinician/profile`. Make sure **Stripe Connect** is enabled on your Stripe dashboard under **Settings → Connect**.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Deploy — the build command is pre-configured in `vercel.json`

Use Turso cloud (Option B) for the production database.

---

## Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run docs:generate  # Regenerate OpenAPI spec → public/api-docs/openapi.json
npm run docs:serve     # Serve API docs locally on port 3001
```

---

## Project Structure

```
app/
  api/               API routes (Next.js Route Handlers)
  admin/             Admin pages
  clinician/         Clinician dashboard pages
  patient/           Patient dashboard pages
  page.tsx           Landing page
components/
  auth/              Login, signup, auth modal
  booking/           Booking + payment modal
  clinician/         Clinician profile card
  dashboard/         Shared dashboard shell
  layout/            Navbar, footer
  ui/                Base UI primitives (Button, Input, etc.)
lib/
  auth.ts            JWT sign/verify utilities
  auth-context.tsx   React auth context + token management
  db/
    index.ts         Turso/LibSQL client + typed query helpers
    schema-youmatter.sql  Single source of truth for DB schema
  email.ts           SendGrid email helpers
  navigation.ts      Nav item definitions per role
  s3.ts              AWS S3 upload helpers
  validation.ts      Zod input schemas
middleware.ts        Route protection + role-based access gating
```
