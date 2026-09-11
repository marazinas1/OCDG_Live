# Phase 2 verification gate (checks only)

No schema change, no data change, no publish. The only file written is the regenerated database types file.

## What will be run

### 1. Public (anon) access
Live REST calls against the three new tables with the anonymous key only:
- `SELECT` on `page_text`, `page_media`, `page_media_defaults` — expect success.
- `INSERT`, `UPDATE`, `DELETE` on each — expect rejection.
Report the actual HTTP status/error for all 12 calls.

### 2. Developer and owner writes
Sign in as a developer account and an owner account in turn, then insert, update and delete a temporary row in `page_text` and in `page_media`. Both roles must succeed (both satisfy the admin check). Every temporary row is removed afterwards and final counts shown.

### 3. Defaults are developer-only
Same temporary insert against `page_media_defaults`:
- developer session — must succeed
- owner session — must be rejected
Report both outcomes with the exact error text for the owner attempt.

### 4. Media storage
- Upload a small temporary image to `page-media` as an admin — expect success.
- Fetch the resulting public URL unauthenticated — expect the image bytes back.
- Attempt the same upload anonymously and as a signed-in non-admin — expect rejection.
Delete the temporary object and confirm the bucket is empty again.

### 5. Security checker
Run the database linter and list every finding. Findings touching the three new tables or the `page-media` bucket are reported verbatim and left unfixed pending your decision.

### 6. Types
Regenerate the database TypeScript types so the repository reflects the new schema. No page or component is wired to them.

### 7. Protected scope unchanged
Re-check row counts and policy lists for `properties`, `property_images`, `leads`, `testimonials`, `user_roles` against the recorded baseline, and confirm each deployed server function still responds as before.

## Baseline already read (before this gate)

- Counts: properties 51, property_images 733, leads 7, testimonials 3, user_roles 2.
- New tables all empty: page_text 0, page_media 0, page_media_defaults 0.
- Policies present as designed: public read on all three; admin-guarded write on `page_text` and `page_media`; developer-guarded write on `page_media_defaults`.

## Note on role sessions

Steps 2-4 need real signed-in sessions for a developer account and an owner account. If an owner account cannot be signed into during the run, that specific sub-check is reported as not executed rather than assumed to pass.

## Out of scope

Content migration, reader rewiring, framework migration, SEO replacement, analytics changes, `site_settings` removal, publishing.
