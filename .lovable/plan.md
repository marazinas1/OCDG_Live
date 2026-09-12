# Phase 4 — Global branding + Home page content

Two related steps, same pattern already proven on About: read content from the new
`page_text` / `page_media` tables through the shared resolver, keep the exact code
fallbacks so nothing changes visually.

## Part A — Global namespace, solved once in the root route

Recommendation: fetch the `global` rows in a **root route loader** (`src/routes/__root.tsx`),
not in `beforeLoad` and not in router context. Reasons:

- The loader is the only place that can do async work and still be SSR-serialized into
  the HTML, so the logo is present in raw server output.
- Router context is built once at router creation and is meant for singletons like the
  query client, not per-request data.
- Root loader data is reachable from any component (including admin pages) via
  `getRouteApi("__root__").useLoaderData()`, with no extra fetch per page.

Work:
1. Add a root loader that calls `fetchContent(["global"])` and returns the resolved
   global branding object (`logoUrl`, `logoDarkUrl`, `siteName`).
2. Add a tiny `useGlobalBranding()` hook wrapping the root loader read, so components
   don't reach into route internals directly.
3. Rewrite `BrandLogo.tsx` to use that hook instead of `useSiteSettings()`, with the
   same fallback layer: bundled `ocdg-logo.png` for the light mark, `null` dark variant
   (keeping the existing brightness/invert behaviour), `SITE_NAME_FALLBACK` for alt text.

Current data confirms parity: `global/site_name` and `global/logo_dark` exist as rows;
`global/logo` does not, so the light logo keeps coming from the bundled asset exactly as
it does today.

## Part B — Index (home) page

1. Add a loader to `src/routes/index.tsx` calling `fetchContent(["home", "global"])` and
   a new `src/lib/content/home.ts` resolver, mirroring `content/about.ts`, using
   `HERO_FALLBACKS` and the bundled hero image as the code fallback layer.
2. Switch `src/pages/Index.tsx` from `useSiteSettings()` to the loader data. Markup,
   classes, parallax and carousel logic untouched.
3. `src/routes/index.tsx` already uses route-level `head()` via `pageHead()`; no
   `<SEO>` usage remains on this page, so that item is already satisfied — the head
   stays as-is.

Expected split, matching the live rows:
- From the table: `hero_eyebrow`, `hero_headline`, `hero_subline`, `hero_cta_label`
- From code fallback: `quote`, `quoteAttribution` (no rows exist), and the hero image

## Not touched

`site_settings`, its admin screens, `useSiteSettings` itself (still used by admin and the
favicon effect), properties, leads, testimonials, user roles, edge functions.

## Verification before reporting done

- `curl` raw `/` and show the full server-rendered `<head>`.
- Browser screenshot of home compared against current rendering, including the navbar
  and footer logo.
- Print the resolved hero values proving the four hero fields come from the table and the
  quote pair comes from fallback.
- Clean typecheck. No publish.
