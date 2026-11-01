# SPARKODERS — Spark Coders website

One-page company site in Arabic (RTL, default) and English (LTR), dark theme, built with
Next.js 16 (App Router, React Server Components), TypeScript (strict), Tailwind CSS v4 and next-intl 4.

Every script, font, style and image is served from the site's own origin. A Content-Security-Policy
header (`next.config.ts`) enforces it, so no third-party CDN can load code into the page.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /ar
npm run build && npm start
npm run lint && npm run typecheck && npm run format:check
```

Copy `.env.example` to `.env.local`:

| Variable                 | Purpose                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Canonical origin for metadata, sitemap and hreflang (default `https://sparkoders.com`).     |
| `SITE_PASSWORD`          | Four digits. With `SITE_GATE_SECRET`, the whole site sits behind `/unlock`; unset → public. |
| `SITE_GATE_SECRET`       | ≥ 32 random characters that sign the unlock cookie; changing it signs everyone out.         |
| `NEXT_PUBLIC_BRAND_FONT` | `default` (Alexandria + IBM Plex) or `thmanyah` (see Brand font below).                     |
| `CONTACT_WEBHOOK_URL`    | HTTPS endpoint that receives contact submissions as JSON. Unset → forms show the email.     |

## Architecture

```
src/
├── app/
│   ├── [locale]/              # ar | en, both statically prerendered
│   │   ├── layout.tsx         # <html lang/dir>, fonts, metadata, JSON-LD, header/footer, cursor, intro loader
│   │   ├── page.tsx           # composes the home sections
│   │   ├── services/ · about/ · contact/  # inner pages (the menu links to pages only)
│   │   ├── work/ · work/[slug]/   # all projects · case study (static per locale × project)
│   │   ├── blog/ · blog/[slug]/   # all articles · article (static per locale × post)
│   │   ├── error.tsx · not-found.tsx · [...rest]/page.tsx (no loading boundary, so unknown URLs answer 404)
│   │   └── opengraph-image.tsx
│   ├── icon.svg · manifest.ts · robots.ts · sitemap.ts
├── assets/fonts/              # Alexandria + IBM Plex Sans Arabic (SIL OFL), loaded with next/font/local
├── components/
│   ├── ui/                    # button (cva), pill, field, icons, reveal, kashida
│   ├── common/                # header, menu, footer, brand logo, custom cursor, page loader
│   ├── feedback/              # error boundary, canvas skeleton
│   └── seo/                   # JSON-LD script
├── features/
│   ├── home/
│   │   ├── components/        # hero, 3D scrub intro, work cards, leads physics, process, team, services, testimonials, blog
│   │   ├── data/content.ts    # ordered keys, images, links (copy lives in messages)
│   │   ├── lib/               # 3D geometry of the logo mark, accent gradients
│   │   └── types/             # keys derived from the message dictionaries
│   └── contact/
│       ├── components/        # contact form, contact section
│       ├── schemas/           # Zod validation
│       ├── services/actions.ts# server actions
│       └── types/
├── hooks/                     # media query, reduced motion, fine pointer, in-view, scroll progress
├── lib/                       # env (Zod), fonts, i18n (routing/navigation/request), seo, site config
├── messages/{ar,en}/          # common · navigation · metadata · home · contact · pages · projects · articles (ar is the source type)
├── services/                  # webhook delivery (server-only)
├── styles/globals.css         # Tailwind v4 @theme tokens, base, shared motion primitives
├── types/                     # next-intl AppConfig, CSS custom properties, SEO, matter-js typings
├── utils/                     # cn(), math helpers
└── proxy.ts                   # next-intl locale routing
```

### Interactive sections

| Section         | Library             | Notes                                                                                       |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| 3D logo intro   | three (bundled)     | Loaded with `next/dynamic` + skeleton; pauses off-screen; WebGL errors fall back to a glow. |
| Leads physics   | matter-js (bundled) | Imported on mount; tap to add pills; mouse users can drag them.                             |
| Cursor & loader | none                | Mouse devices only; the intro plays once per session.                                       |

| Hero entrance | gsap + SplitText | Headline lines rise out of their masks; content stays visible without JS. |
| Pinned intro | gsap ScrollTrigger | `pin` + `scrub: 1`; the timeline's progress also drives the 3D scene. |
| Links, forms, cards | CSS (transitions.dev patterns) | Card lift, learn-more arrow, error shake, soft text swap. |

All motion respects `prefers-reduced-motion`: loops stop, nothing pins, and state changes keep their
opacity cue without travel or blur.

Design rules applied (impeccable craft floor, make-interfaces-feel-better): no labels above headings,
gradient text only for the hero's changing word and the wordmark, section titles share one size (display-xl, ≤ 3.75rem),
≥ 5:1 contrast for small text, balanced headings, tabular numerals, 0.96 press scale, icon stroke
matched to text weight, themed scrollbar/caret/selection.

## Brand tokens (`src/styles/globals.css`)

| Token                      | Value                             |
| -------------------------- | --------------------------------- |
| `violet` / `plum`          | `#B26CFF` / `#6E29AC`             |
| `ocean` / `aqua` / `lilac` | `#0C8EC7` / `#7FEEFA` / `#A497FA` |
| `ink` / `ink-2` / `ink-3`  | `#07051A` / `#0E0A26` / `#17123A` |

## Content to replace before launch

- Case studies (`messages/*/projects.json`) and articles (`messages/*/articles.json`) are sample
  content: client names, figures and text must be replaced with real ones before launch.
- Project, blog and team photos: put files in `public/images/…` and set `image` in
  `src/features/home/data/content.ts` (until then each card shows its brand-gradient artwork).
- Team names, testimonial authors, social links and phone number (`src/messages/*`, `src/lib/config/site.ts`).
- Logo: the source file is `brand-source/sparkoders-logo.svg`. The S mark is inline vector
  (`src/components/common/spark-mark.tsx`); SPARKODERS and the slogan are outlined paths
  (`src/components/common/wordmark.tsx`, Chakra Petch, OFL), so no font is fetched. Raster copies
  for icons, the share image and the 3D texture are in `public/brand/` and `src/app/`; the 3D outline
  is `src/features/home/lib/mark-outline.ts`.

## Private mode

`src/proxy.ts` gates every page and file (fonts and images in `public/` included) until the visitor
enters `SITE_PASSWORD` on `/unlock`. The unlock cookie is httpOnly, lasts 30 days and is an HMAC under
`SITE_GATE_SECRET`, so it cannot be forged; the contact server action checks it too.
Failed attempts are slowed down, but four digits are a privacy curtain, not strong security.
Responses carry `X-Robots-Tag: noindex, nofollow` while the gate is on.

## Brand font (Thmanyah Sans)

Thmanyah's license forbids publishing the font files and this repository is public, so Git holds
them only as AES-256-GCM ciphertext in `assets-encrypted/thmanyah/`. Before every build,
`scripts/brand-fonts.mjs decrypt` (the `prebuild` script) writes the real files to
`public/fonts/thmanyah/` (git-ignored) using `FONT_ASSETS_KEY`, which lives only in Vercel.
`NEXT_PUBLIC_BRAND_FONT=thmanyah` then switches every role to Thmanyah Sans. Without the key the
build keeps the default fonts.

To replace the files: put the new `.woff2` files in `public/fonts/thmanyah/` and run
`FONT_ASSETS_KEY=… node scripts/brand-fonts.mjs encrypt`.
