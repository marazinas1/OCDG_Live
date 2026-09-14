# Redirect `/sold` → `/developments/sold`

## Goal
Replace the standalone `/sold` route (currently rendering the placeholder "Photo Coming Soon" page) with a pure `beforeLoad` redirect to `/developments/sold`, using the same pattern already used for legacy routes.

## Change
- Rewrite `src/routes/sold.tsx` to:
  - import `createFileRoute, redirect` from `@tanstack/react-router`
  - export a route with `beforeLoad: () => { throw redirect({ to: "/developments/sold", replace: true }); }`
  - no `component`, no `loader`, no `head()`

## Verification
1. `bunx tsc --noEmit` passes.
2. `curl -I /sold` returns HTTP 307 to `/developments/sold`.
3. `/developments/sold` still returns HTTP 200 and renders the sold portfolio correctly.
4. No other files modified.

## Not in scope
- Internal nav/footer links that still point to `/sold` will simply follow the redirect; they do not need to be changed for this fix.
- The `Sold` page component file is left untouched as dead code; it can be removed in a later cleanup if desired.

## Publish
No publish without explicit approval.