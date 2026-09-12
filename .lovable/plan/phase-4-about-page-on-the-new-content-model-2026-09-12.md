# Phase 4 — About page on the new content model

Move the About page onto the `page_text` / `page_media` / `page_media_defaults` tables through a reusable resolver that every remaining page will use. Zero visible change on the live page.

## What the checks showed

- `page_text` for `about` currently holds only the two partners (`partner.01.*`, `partner.02.*`). Every other About text slot is absent, so the page is rendered today entirely from the code fallback constants in `src/hooks/useSiteSettings.ts`.
- `page_media` holds one row only: `global/logo_dark`. There are no About images and no partner logos in the tables.
- The old `site_settings` row confirms this: all `about_*` text and image columns are NULL, and both stored partners have `logo_path: null`.

Parity consequence: today the two partners render **without** logo images, because a stored partner with no logo shows no logo. The resolver must keep that exact behaviour — partner logos come only from a stored media row, never from a bundled fallback logo. Falling back to the bundled Halliday / Halliday-Leonard logos here would make two logos appear that are not on the page today.

## Work

1. **New `src/lib/content-resolver.ts`**
   - `resolveText(rows, page, slot, fallback)` — stored non-blank value, else the code fallback.
   - `resolveMedia(rows, defaults, page, slot, fallback)` — stored media row (public URL built from its own `bucket` + `storage_path`), else the developer default row, else the bundled asset.
   - `collectPartners(...)` — walks numbered `partner.NN.*` slots in order, builds `{ id, name, url, description, logoUrl }`; `logoUrl` is null when no media row exists.
   - Fallback layer reuses the existing `HERO_FALLBACKS` / `ABOUT_FALLBACKS` constants and the already-imported bundled assets verbatim. No new copy or images are invented.

2. **Server loader on `src/routes/about.tsx`** — one fetch of `page_text`, `page_media`, `page_media_defaults` limited to pages `about` and `global`, resolved into a typed About content object so the text and images are present in the server-rendered HTML.

3. **`src/pages/About.tsx`** — reads the loader data instead of the `about` branch of `useSiteSettings()`. Markup, classes, animations and layout untouched. `useSiteSettings()` stays in place for anything outside About (nav/footer branding) and the old `site_settings` table is not dropped in this phase.

4. **`head()`** — About already uses route-level `pageHead()`, same as Contact. It keeps that; no `<SEO>` component remains in this page.

## Verification before reporting done

- `curl` the raw `/about` HTML and show the exact `<head>` block.
- Compare the rendered About page against the current one section by section: hero, story text and quote, portrait and promise, partners.
- Confirm both partners render from the tables, with no logo images (matching today).
- Confirm at code level that editing an `about` row in `page_text` changes the page: the loader has no static cache and the stored value wins over the fallback.
- Typecheck clean. Nothing published.

## Technical notes

- Media URLs are resolved per-row from that row's own `bucket`, so the existing `brand-assets` objects keep working without moving files.
- The resolver is written so the remaining 13 pages reuse it unchanged; only their fallback constant maps differ.
