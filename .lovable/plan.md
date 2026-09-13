# Phase 4 — Developments page (tabs + grid + "See More") served from the server

Same approach already used for the category pages: the property list comes from the
server on first request, and the page keeps behaving exactly as it does today.

## 1. Server-loaded property list

`src/routes/developments/index.tsx` gets a loader that calls the shared
`fetchPropertyCards()` (no status argument — all published, page-backed properties),
the very same function the client hook uses, so server and client can never drift.

`src/pages/Developments.tsx` accepts an optional `properties` prop and passes it to
`usePublicProperties({ initialData: properties })`, matching the CategoryPage pattern.
The loading skeleton stays for the case where no server data is present.

## 2. Tab selection must be correct on the first render

Today the active tab is initialised from `?filter=` read through `useSearchParams`
(the compat shim, which reads TanStack's location — available during server render),
and the `useEffect` that re-syncs on search changes plus the `handleTabChange`
handler both reset `visibleCount` to 9.

Work here: verify — not rewrite — that both reset points behave identically under the
new router, and that a direct load of `/developments?filter=sold` renders the Sold
grid in the server HTML with no flash of "All" after hydration. If the search string
is not visible during server render, the fix is to derive the tab from the route's
validated search value instead of component state, keeping the same normalisation
(`active` / `under-contract` / `current` -> current, `sold` -> sold, else all).

## 3. Metadata

`/developments` already has a route-level `head()` from the framework swap. Only its
correctness is confirmed; no change unless something is wrong.

## 4. Behaviour that must stay identical

- "All" tab: the two carousels plus the "See All …" links.
- Filtered tabs: the 3-column grid with "See More" adding 9 more cards.
- Tab switching happens client-side, no page reload.
- No visual change anywhere.

## Verification

- Raw server HTML for `/developments`, `/developments?filter=current`,
  `/developments?filter=sold` — each must already contain the right tab's content.
- Screenshots of all three states.
- "See More" paging and tab switching exercised in the browser.
- Clean typecheck.
- Nothing published.
