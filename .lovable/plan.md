# Phase 4 — why Contact can't go first, and what to do instead

## The blocker

The project is still fully on the old setup: `index.html`, `src/main.tsx`, `src/App.tsx` with React Router, `react-router-dom` in the dependency list, no `src/routes/` directory. I checked all of these just now.

Route-level `head()` and server-rendered HTML only exist once the app itself runs on the new framework. There is no way to convert one page: the server entry, the root document, the router and the page-shell are shared by every page at once. If I hand-built a `src/routes/contact.tsx` today, nothing would load it, and your step-5 check (raw HTML from the server, before any JavaScript) would return the same empty shell it returns now — because the current setup has no server rendering at all.

So "one page first" is not a smaller, safer version of the migration. It's a step that cannot produce the result you want to verify.

## What I propose instead

Run the framework switch as one operation, using the built-in migration path (the same one used on your other projects), and then treat Contact as the first page you inspect and sign off on.

Order:

1. **Framework switch (one pass).** Preflight scan, clean build check, then the whole app moves over: root document, router, all 14 routes as files, the same URLs, the same look. Your `index.html` tags, page-view tracking hook and any startup code get carried across.
2. **Contact first for review.** Immediately after, Contact gets the treatment you described: its `SEO` usage replaced by a route-level `head()` with the exact same title/description/OG/canonical values, hardcoded at this stage. No content tables yet.
3. **Then the remaining 13 pages** follow the pattern Contact establishes, page by page, so you can review each.

## Contact specifics (confirmed by reading the file)

- It has **no** page data loading — the only database work is the form submission itself. So no server loader is needed; it stays a static page plus a form.
- The submission logic is untouched: the same insert into `leads` and the same call to the inquiry-notification function, in the same order, with the same error handling. I only move the file and swap the meta-tag mechanism.
- `SEO` component usage is removed from this page only. Every other page keeps using it until its own turn.

## Verification I will report

- The exact `<head>` the server returns for `/contact`, fetched with curl against the running server, before any JavaScript — shown to you verbatim.
- Contact rendered side by side against the current version, layout and text unchanged.
- A real test inquiry submitted through the form, then shown as a row in the leads table (and removed afterwards if you prefer).
- Clean typecheck.
- Nothing published.

## Risks worth stating plainly

- The framework switch touches the whole app in one turn, including the admin panel. It is reversible from chat history.
- The build must be green before it starts; if it isn't, I stop and tell you rather than migrating onto a broken baseline.
- Styling is the usual regression risk (the styling engine version changes). I carry over the custom tokens and check the pages visually.

## Decision needed

Approving this plan means: run the framework switch now, in one pass, then do Contact as the first reviewed page. If you'd rather keep the switch as a separate approval, say so and I'll stop after the preflight summary.
