# Phase 4 — Category pages served from the server

Goal: the five portfolio listing pages send their property cards inside the first HTML response, so search engines and link previews see the homes immediately instead of after JavaScript runs. Nothing changes visually.

## One correction before starting

The five pages that share the common listing layout are:

- Active Listings (`/developments/active-listings`)
- Under Contract (`/developments/under-contract`)
- Current Developments (`/developments/current`)
- Sold (`/developments/sold`)
- Coming Soon (`/developments/coming-soon`)

There is also an older standalone `/sold` page with three hardcoded placeholder entries ("Photo Coming Soon"). It is not part of this shared layout and is not touched here — flag it if you want it retired separately.

Also worth noting: the page titles/descriptions were already converted to the new server-rendered form during the framework swap. Each of the five routes already carries its exact original title and description. This step verifies them rather than rewriting them, with one gap to fix: the standalone `/sold` page has no title/description at all.

## What changes

1. A single shared data function fetches published properties for a given status set, reusing the exact query, image selection and sort order used today.
2. Each of the five routes gets its own server-side data step calling that one function with its own status filter.
3. The shared listing layout accepts the already-fetched list, keeping the loading skeleton for any client-side refresh and leaving the "See More" paging behaviour exactly as-is.
4. On the Sold page, the "past developments" record-only strip is loaded the same way so it too appears in the first response.
5. The property lists stay in sync after navigation using the existing caching layer, so no duplicate fetching.

## What does not change

- No change to properties, property images, leads, testimonials, roles, or any policy.
- No visual, text, spacing or layout change on any of the five pages.
- Homepage and the main Developments page keep their current data flow in this step.

## Technical notes

- Add `src/lib/content/properties.ts` exporting `fetchPropertyCards({ status, includeRecordOnly })` and `fetchPastDevelopments()`, lifted verbatim from `usePublicProperties.ts` (query fields, `card`/`hero` image preference, listed_date-then-created_at sort) so hook and loader cannot drift; the hook re-exports the same function as its `queryFn`.
- Each route file (`developments/active-listings.tsx`, `under-contract.tsx`, `current.tsx`, `sold/index.tsx`, `coming-soon.tsx`) gets `loader: () => fetchPropertyCards({ status: ... })`; `sold/index.tsx` loads both lists. The Supabase browser client already runs fine under SSR (same pattern as the About/home loaders).
- `CategoryPage` takes an optional `properties` prop; when provided it skips `usePublicProperties` and renders immediately, `isLoading` false. Pagination state and `PAGE_SIZE` untouched. Wrappers read loader data via `getRouteApi("<routeId>").useLoaderData()`.
- `PastDevelopmentsSection` takes an optional `items` prop with the same fallback rule.
- Add `pageHead` to `src/routes/sold.tsx` (currently missing) with a title/description matching its "Sold Projects" heading.

## Verification

- `curl` raw HTML for all five URLs: confirm each returns its own title, description, OG/Twitter tags and canonical, and that property titles and image URLs are present in the raw body before any JavaScript.
- Browser screenshots of all five pages compared against the current rendering, including "See More" still paging in nines.
- Clean typecheck.
- Nothing published.
