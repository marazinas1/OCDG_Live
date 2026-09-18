# FRONTEND.md — Ocean City Development Group

Front-end conventions for this repo. Read together with `AGENTS.md` (project
rules and history) and `PLAN.md` (roadmap).

## Stack

- TanStack Start v1 + React 19, SSR on for every public route.
- Vite build, Tailwind v4 (CSS-first, tokens in `src/styles.css`, no
  `tailwind.config.js`), shadcn/ui components.
- Lovable Cloud for database, auth, storage, analytics.

## Routing

- Routes live in `src/routes/`; page bodies live in `src/pages/` and are
  imported by the route file. The route owns `loader`, `head()` and search
  params; the page owns markup.
- Admin routes are under `/admin/*`, client-rendered, gated once by
  `AdminProtected` → `useAdminAuth`. No per-page redirect effects.
- Legacy paths (`/sold`, old slugs) are pure `beforeLoad` redirects — no
  fetching, no component.

## Content model

Nothing user-visible is hardcoded unless it is structural. Every editable
string resolves through the content system:

```
src/lib/content/*.ts   fallbacks + resolvers (global, home, about, contact,
                       business, pages)
src/lib/content-resolver.ts   resolveText / resolveOptionalText / resolveMedia
```

- Slots are `page` + `slot` rows in `page_text` / `page_media`; developer
  defaults live in `page_media_defaults`.
- Slot names describe position, never current wording
  (`hero_title`, `advantage.01.title`, `partner.02.logo`).
- Every resolver takes a fallback, so the site renders fully before any row
  exists.
- Adding an editable string = new slot + new field in the matching
  `AdminSettings` tab. A public page with text nobody can edit is a bug.

## Styling

- Colours, fonts and radii come from the semantic tokens in
  `src/styles.css`. Never hardcode a hex or a raw Tailwind colour in a
  component.
- Buttons use the unified system in `src/styles.css`
  (`btn-primary`, `btn-outline`, `btn-ghost`, `btn-on-dark`, `btn-toggle`,
  `btn-icon`, `btn-dot`, `btn-nav`, size modifiers). Never restyle a button
  inline — extend the system.
- The global base rule gives every interactive element `cursor: pointer` and
  disabled ones `cursor: not-allowed`. No per-component cursor fixes.
- Motion: ScrollReveal fade-in, parallax headers, Ken Burns hero. All of it
  is suppressed by the `prefers-reduced-motion` block in `src/styles.css`.
- Fonts load via `<link>` in `src/routes/__root.tsx`, never `@import` in CSS.
- Urbanist (300–800) is the only typeface across the public site, auth and admin.

## SEO

- Every public route defines its own `head()` via `pageHead()` in
  `src/lib/seo.ts`: unique title, description, canonical, OG/Twitter.
- `og:image` must be an absolute https URL — use `absoluteOgImage()`; it falls
  back to `DEFAULT_OG_IMAGE` (`/og-image.jpg`) for anything relative or
  bundled.
- JSON-LD: `Organization` on the root (generated from business settings),
  `BreadcrumbList` on every content route, property schema on home pages.
- `/sitemap.xml` is a live route (`src/routes/sitemap[.]xml.tsx`) built from
  published rows. There is no static sitemap file and no generator script.
- `robots.txt` allows the public site, disallows `/admin` and `/api`.
  Preview deployments render `noindex`.

## Images

Resize to 2400 px max, JPG q82 progressive, 200 KB–1.5 MB before anything
enters `src/assets` or storage. Uploads through the admin go through the
optimisation path; replacing or deleting an image deletes the old object.

## Admin panel

Menu order is fixed: Workspace (Dashboard, Inquiries, Analytics) → Manage
(Properties, Testimonials) → Settings (Users, Settings). Articles are not part
of this project yet.

Settings tabs mirror the public menu: Business & appearance (business details,
logo, favicon, logo size, and maintenance mode as an always-visible final card inside
it), then Home, Developments, Gallery, Testimonials, About, and Contact last.
Each page tab edits both the texts and the images of that page.

Tabs everywhere use the shared `src/components/admin/AdminTabs.tsx` treatment:
transparent horizontal row, stable height and a 3 px primary underline for the
active trigger. Repeating records (testimonials) are expandable rows with
inline editing, an "Expand all / Collapse all" control and a "Shown on site"
switch.

Admin pages use the full shell content width. Only dialogs, public previews and
intrinsically short fields may use a maximum width.

Developer and Owner can access every admin area. Editor can access Dashboard,
Properties, Testimonials and public-page Settings tabs. Editor cannot access
Inquiries, Analytics, Users, Business & appearance, maintenance or destructive
actions. Security is enforced by database policies as well as reflected in UI.

Behaviour rules: every list has a plain-language empty state, destructive
actions confirm and say what is lost, saves show a toast, and unsaved changes
warn before leaving the page.

## Before calling work done

`bunx tsc --noEmit` and `bun run build` clean, the change verified in the
browser, schema changes present in `supabase/migrations/` (never `drizzle/`),
and nothing published without explicit approval.
