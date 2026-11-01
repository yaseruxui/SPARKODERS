# SPARKODERS

Monorepo for the SPARKODERS (سبارك كودرز) website, its admin dashboard and the API between them.

| Path                  | What                                                       | Stack                                     |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| `apps/web`            | Public site, Arabic (RTL) + English                        | Next.js 16, Tailwind 4, next-intl, GSAP   |
| `apps/admin`          | Dashboard: inbox, users and (next phases) all site content | React 19, Vite, shadcn/ui, TanStack Query |
| `apps/api`            | REST API: auth, users and permissions, contact inbox       | NestJS 12, Prisma 7 (SQLite → Postgres)   |
| `packages/contracts`  | Data shapes shared by all three (Zod schemas + types)      | Zod 4                                     |
| `docs/brand`          | Brand identity guide (open in a browser)                   | HTML                                      |

The admin dashboard follows the Sekka dashboard (`yaseruxui/sekka-dashboard`): same layout,
components and flows, rebuilt on NestJS + React instead of Laravel + Inertia.

## Getting started

```bash
npm install                      # all workspaces; builds packages/contracts
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/web/.env.example apps/web/.env.local

npm run db:migrate -w @sparkoders/api            # creates apps/api/prisma/dev.db
npm run build -w @sparkoders/api
npm run admin:create -w @sparkoders/api -- you@example.com "Your Name"   # asks for a password

npm run dev:api      # http://localhost:4000
npm run dev:admin    # http://localhost:5173
npm run dev:web      # http://localhost:3000
```

To send the site's contact form to the dashboard, set in `apps/web/.env.local`:

```
CONTACT_WEBHOOK_URL=http://localhost:4000/public/contact
CONTACT_WEBHOOK_KEY=<the same value as CONTACT_WEBHOOK_KEY in apps/api/.env>
```

Without them the site still works and the form asks visitors to email instead. In production
the URL must be https (the site refuses to start otherwise).

To let the dashboard edit the site's content, also set in `apps/web/.env.local`:

```
CMS_API_URL=http://localhost:4000
REVALIDATE_SECRET=<the same value as SITE_REVALIDATE_SECRET in apps/api/.env>
```

and in `apps/api/.env`: `SITE_URL=http://localhost:3000` and `SITE_REVALIDATE_SECRET=…`.
Then open the dashboard → الخدمات → «استيراد من الموقع». Without `CMS_API_URL` the site simply
shows its bundled content.

## How the pieces talk

- **Site → API**: the contact form's server action POSTs a `ContactSubmission` to
  `{API}/public/contact` with the `x-contact-key` header. It lands in the dashboard inbox.
- **Dashboard → API**: the browser calls the API with an httpOnly session cookie and the
  `x-sparkoders-admin: 1` header (required on every change; it also blocks cross-site forgery).
  CORS allows only `ADMIN_URL`. Admin and API on different sites need `COOKIE_SAMESITE=none`.
- **Contracts**: every request and response shape is a Zod schema in `packages/contracts`, so a
  change to a field breaks the build of whichever app is out of step.

## Roadmap

1. ✅ Monorepo; API with auth, users, invitations and permissions; inbox wired to the site form;
   dashboard with login, overview, inbox, users and settings.
2. ✅ Site content in the dashboard: services, team, testimonials, every page text (Arabic and
   English), contact details and socials, and a media library. The site reads them from the API
   (`CMS_API_URL`, cached under the `cms` tag) and falls back to its bundled copy; every save calls
   the site's `/api/revalidate`. «استيراد من الموقع» copies the bundled content in once.
3. ✅ Projects (case studies with results) and blog articles (block editor for the body, Arabic
   and English) in the dashboard. New slugs render on first visit, no rebuild needed.
4. ✅ Notifications: a bell in the dashboard and an email for every new enquiry; mail (SMTP)
   settings with a test send; invitations are emailed when mail is set up. The SMTP password is
   stored encrypted.

Next: deploy (API + database + object storage for uploads), real content, and SEO extras.

## Deployment

- **Site**: Vercel project `skodr`, linked to this repository with root directory `apps/web`
  (files outside it are included, so the shared contracts build too). Pushes deploy previews;
  production follows the production branch. Environment variables live in the Vercel project.
- **API and dashboard**: not deployed yet. The API needs a database (see below) and object storage
  for uploads; the dashboard is a static Vite build pointing at the API (`VITE_API_URL`).

## Database

Development uses SQLite (`apps/api/prisma/dev.db`, not committed). To use Postgres: set
`provider = "postgresql"` in `apps/api/prisma/schema.prisma`, point `DATABASE_URL` at the server,
swap `@prisma/adapter-libsql` for `@prisma/adapter-pg` in `apps/api/src/prisma/prisma.service.ts`,
then run `npx prisma migrate dev` to create a fresh Postgres migration.

## Checks

```bash
npm run typecheck
npm run build
```
