# Correct the Phase 2 migration record and remove Drizzle

No database migration will be applied, no live data or policies will be changed, and nothing will be published.

## 1. Preserve the existing SQL under the correct migration system

- Copy `drizzle/migrations/0000_create_page_content_foundation.sql` byte-for-byte to `supabase/migrations/20260911140000_create_page_content_tables.sql`.
- Treat this as repository history only. Do not execute it against the already-correct database.
- Verify the source and destination are byte-identical before deleting the source directory.

## 2. Remove active Drizzle tooling completely

- Delete `drizzle.config.ts` and the entire `drizzle/` directory.
- Remove `drizzle-kit` and `drizzle-orm` from `package.json`.
- Refresh the repository lockfiles so neither package nor Drizzle-only transitive packages remain recorded.
- Do not alter application dependencies or database code beyond this cleanup.

## 3. Record the recurring-project warning

Append this section to root `AGENTS.md` exactly as requested:

### Žinoma pasikartojanti problema

> Šis Lovable projektas kartkartėmis sugeneruoja Drizzle migracijas (drizzle/ katalogas, drizzle.config.ts) vietoj įprastų supabase/migrations/*.sql failų, nepaisant to, kad projekto istorija visada naudojo pastaruosius. Tai įvyko bent tris kartus. Kai schema keitimas paprašomas, VISADA patikrink po darbo, ar migracija atsirado supabase/migrations/, o ne drizzle/. Jei atsirado drizzle/, sutvarkyk tuo pačiu būdu: nukopijuok SQL turinį pažodžiui į supabase/migrations/, tada pašalink drizzle artefaktus.

## Verification

1. Confirm the new migration exists under `supabase/migrations/` and its SQL is byte-identical to the former Drizzle migration.
2. Confirm `drizzle.config.ts` and `drizzle/` no longer exist.
3. Confirm `package.json` and lockfiles contain no Drizzle packages.
4. Search active project files for remaining Drizzle references, excluding `AGENTS.md`, `PLAN.md`, and archived plan notes because those intentionally document the term.
5. Confirm the new `AGENTS.md` section and exact requested text are present.
6. Run the TypeScript typecheck cleanly.
7. Do not publish.