# OCDG — TanStack Start migration roadmap

## Done (migration id mig_01m28bs0g4e6s9sdkdchr21sqq)
- [x] Framework swap: Vite SPA + react-router-dom → TanStack Start SSR (Tailwind v4, React 19, strict TS)
- [x] All 24 route files generated; route-level head() replaces react-helmet-async on every page
- [x] Body JSON-LD preserved (Testimonials reviews, PropertyPage listing schema)
- [x] Router-compat shim; all react-router-dom imports rewritten; usePageTracking beacon untouched
- [x] Edge functions: 7 found, 0 migrated, 7 left on Supabase (per AGENTS.md protected scope)
- [x] Gates: bun run build green; tsc --noEmit clean (0 silenced files); all routes SSR 200; unknown path 404
- [x] Raw server HTML verified: correct title/description/OG/canonical on /contact and /developments/109-anchor-road (DB-driven)
- [x] All 6 legacy redirect patterns verified with curl (307 → canonical targets)
- [x] Contact form path verified: anon insert into leads succeeded (HTTP 201), row confirmed, test row deleted, count back to 7
- [x] .lovable/project.json written; migration completion recorded

## Pending user verification (needs real credentials — cannot be done from sandbox)
- [ ] developer / owner / editor real logins in preview + session persists after reload
- [ ] Visual parity walk-through of public site and admin panel in preview

## Rules still in force
- No publish until user explicitly approves

## Admin refresh — current Deerva standards
- [ ] Replace framed admin tabs with the current underline treatment
- [ ] Unify admin buttons, tokens, headers, badges, and responsive spacing
- [ ] Complete loading, empty, error, count, and retry states
- [ ] Strengthen dirty-state protection in Settings and Testimonials
- [ ] Verify every admin screen on desktop and mobile; do not publish
