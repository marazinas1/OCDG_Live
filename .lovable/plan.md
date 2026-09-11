# Framework switch — preflight report, stopping before the swap

No files have been changed. This is the read-only scan you asked for, plus answers to your four questions.

## 1. Build status

`bun run build` finished **green**, exit code 0, built in 10.4s. Only a chunk-size advisory (the analytics page and the main bundle are large) — that is a warning, not an error. The baseline is clean, so any error that appears after the swap is attributable to the swap.

## 2. What physically changes

**Removed dependencies:** `react-router-dom`, `react-helmet-async`, `tailwindcss` v3, `autoprefixer`, `postcss`, `@vitejs/plugin-react-swc`, `lovable-tagger`, plus the old React 18 pairing.

**Added:** the TanStack Start framework packages (router, start, the Lovable Vite config wrapper, the server runtime), React 19, Tailwind **v4**.

**Yes — Tailwind v3 → v4 is part of this same step**, not a later one. It cannot be separated: the new setup's styling pipeline is v4-only. Your 71 custom design tokens in `src/index.css` and the 98-line Tailwind config get carried over into the new stylesheet, and I sweep for the handful of v4 class renames (`shadow-sm`, `rounded`, `ring`, `outline-none`, border colour default). This is the single biggest visual-regression risk of the whole operation and is where I'll spend the most review time.

**Deleted files:** `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `tailwind.config.ts`, `postcss.config.js`, the two extra tsconfigs, `vitest.config.ts` and `src/test/`.

**New `src/routes/` structure** — all 26 route declarations become files, same URLs:

```text
__root.tsx                          (document head, providers, page tracking)
index.tsx                           /
about.tsx  contact.tsx  gallery.tsx  sold.tsx  testimonials.tsx
developments/index.tsx
developments/active-listings.tsx  under-contract.tsx  coming-soon.tsx
developments/current.tsx  sold.tsx
developments/$slug.tsx              /developments/:slug
developments/current-projects.$slug.tsx  (+ the 3 other legacy redirect paths)
admin/login.tsx  index.tsx  properties/index.tsx  properties/new.tsx
admin/properties/$id.edit.tsx  inquiries.tsx  preview.tsx  testimonials.tsx
admin/settings.tsx  users.tsx  analytics.tsx  set-password.tsx
$.tsx                               (404 catch-all)
```

**Not touched:** the database, all RLS policies, every edge function, `supabase/migrations`, the sitemap script, and all your page components' internals.

**One thing to expect:** TypeScript strictness. Your current config has `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`; the new one turns these on (the router requires it). That produces a wave of type errors on first build which I work through — it's mechanical, not a redesign.

## 3. Admin panel

Functionally it survives. The 10 admin pages, `AdminProtected`, `AdminShell`, the role checks, `manage-users`, sessions and login all keep working — they're ordinary React talking to the backend, and nothing about auth or roles changes.

Two mechanical adjustments: navigation calls (`useNavigate`, `Link`, `useParams`) switch to the new router's equivalents, and anything reading `localStorage` at module load gets guarded, because the server now runs the code too. Login and session storage are the main place that matters.

**I would still do a separate admin review pass afterwards** — click through login, properties edit, inquiries, settings, users, analytics — before Patrick sees any of it. Type-checking cannot prove a role guard still guards.

## 4. Meta tags, tracking and SEO during the swap

- **`index.html` head content** (title, description, favicons, OG/Twitter tags, the JSON-LD block, the font preconnects, and the preview-noindex script) moves wholesale into the new root document. It keeps working, and from that moment it is **server-rendered** — which is more than it does today.
- **Page-view tracking** keeps working. The hook currently depends on React Router's location; I rewrite it against the new router with identical behaviour (fires per route change, skips `/admin/*`, same beacon format). No analytics gap.
- **The `<SEO>` component in 8 files** (Index, About, Contact, Developments, Gallery, Testimonials, PropertyPage, CategoryPage) — this is the honest part. `react-helmet-async` is removed, so those usages must be converted in the same pass or those pages lose their per-page tags. I convert all 8 to route-level `head()` during the swap, carrying the exact same title/description/OG/canonical values, still hardcoded. Nothing regresses; per-page tags simply become server-rendered instead of client-injected.
- **Property pages** get their `head()` fed by a server loader so a listing's title, description and image are in the raw HTML — the original reason for this migration.

## Then Contact first for review

Right after the swap I present Contact as the reference page: raw `curl` of the server HTML showing the real `<head>`, a side-by-side against the current version, a live test inquiry landing in the leads table, and a clean typecheck. The contact form's insert and notification call are not modified.

## Your decision

Approve to run the swap in one pass (it is revertible from chat history), or tell me to split further — though the only genuinely separable pieces are the post-swap review passes, not the framework/Tailwind/router change itself, which is atomic by nature.
