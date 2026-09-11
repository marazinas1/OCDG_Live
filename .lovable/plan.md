# OCDG TanStack Start migration — Phase 0 closure and Phase 2 foundation

## Phase 0 — confirmed

### Publishing and custom domain

The TanStack Start version will continue to use Lovable’s normal **Publish / Update** workflow. It does **not** require a separate deployment pipeline.

- The existing published Vite version remains live until the upgraded snapshot is explicitly published.
- The existing `oceancitydevelopment.com` and `www.oceancitydevelopment.com` connections remain attached to this project.
- Preview can be validated privately before publishing.
- After migration, Lovable automatically uses its TanStack Start publishing pipeline behind the same Publish interface.
- No publishing is included in Phases 1 or 2.

This is confirmed by Lovable’s current TanStack Start migration documentation and matches the intended snapshot/preview workflow.

### Scope boundary

The following remain unchanged in schema, policies, and business logic:

- `properties`
- `property_images`
- `leads`
- `testimonials`
- `user_roles`
- all existing server functions, including user management, inquiries, analytics, sitemap, and email functions

Only the new content tables, their storage rules, and later the framework/rendering consumers are in scope. If later work genuinely requires a protected-table or existing-function change, that phase stops for a separate reviewed plan.

## Phase 1 — preserve the project instructions first

Before any database or application change:

1. Copy the uploaded `OCDG_AGENTS.md` byte-for-byte to root `AGENTS.md`.
2. Copy the uploaded `OCDG_PLAN.md` byte-for-byte to root `PLAN.md`.
3. Verify both copies match their uploads exactly by checksum.

No edits or reinterpretation will be made while copying them.

## Phase 2 — content schema only

Create one plain SQL migration under `supabase/migrations/`. It will create the structure and access rules only; it will not move content, switch readers, alter `site_settings`, or change the interface.

### 1. `page_text`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `page text not null`
- `slot text not null`
- `value text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (page, slot)`
- non-empty checks for trimmed `page` and `slot`

Access:

- explicit `SELECT` grants for public and signed-in visitors
- explicit CRUD grant for signed-in users and full grant for server-side operations
- row-level security enabled
- public read policy
- insert/update/delete restricted by the existing `public.is_admin(auth.uid())`
- existing `update_updated_at_column()` trigger

There is no `locale` column because OCDG is English-only.

### 2. `page_media`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `page text not null`
- `slot text not null`
- `bucket text not null default 'page-media'`
- `storage_path text not null`
- `alt_text text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (page, slot)`
- non-empty checks for `page`, `slot`, `bucket`, and `storage_path`

Access mirrors editable text: public read, while developer/owner writes use `is_admin(auth.uid())`.

**Correction to the uploaded draft:** retain a `bucket` column. The current custom dark logo is stored in `brand-assets`, while the new model proposes `page-media`. Recording the bucket makes migration and rollback explicit and prevents ambiguous paths. Phase 3 can copy assets safely into the new bucket and then store `page-media` for migrated rows.

### 3. `page_media_defaults`

Use the same columns and uniqueness rules as `page_media`.

Access:

- public read
- explicit grants and row-level security
- writes restricted to `public.is_developer(auth.uid())`, not `is_admin()`

**Safety correction:** owner-managed media belongs in `page_media`; developer-pinned fallback media belongs in `page_media_defaults`. Restricting defaults to developers preserves the three-layer contract and matches the proven portfolio pattern. Patrick retains full control over visible owner media without being able to overwrite the recovery baseline.

### 4. Storage

Create a public `page-media` bucket through Lovable Cloud’s supported storage operation, then add object policies in the same Phase 2 change set:

- public read for `page-media`
- developer/owner insert, update, and delete via `is_admin(auth.uid())`
- no changes to `brand-assets` or `property-images`
- conservative image MIME types and the existing 20 MB per-file ceiling

No existing object is moved or deleted in this phase.

## Slot conventions fixed before data migration

Use three page namespaces:

- `global`: site name, logo, dark logo, favicon
- `home`: hero copy/media and Patrick quote
- `about`: About copy/media and collaborators

This corrects the draft’s proposed `home`/`about`-only mapping: brand identity is global and should not be semantically owned by the homepage.

For the editable collaborators list, do not place the entire structure into one opaque JSON string. Keep the requested three-table model by using grouped atomic slots:

```text
page_text:  about / partner.01.name
page_text:  about / partner.01.url
page_text:  about / partner.01.description
page_media: about / partner.01.logo
```

Additional partners use `partner.02.*`, and ordering follows the numeric group. This preserves dynamic add/remove/reorder behavior while keeping each editable value addressable and avoiding a fourth table or JSON parsing contract.

## Phase 2 validation gate

Before proposing Phase 3:

1. Confirm all three tables exist with the exact columns, constraints, grants, and update triggers.
2. Confirm public reads succeed and public writes fail.
3. Confirm developer and owner can write `page_text` and `page_media`.
4. Confirm only developer can write `page_media_defaults`.
5. Confirm the `page-media` bucket accepts authorized image uploads, serves them publicly, and blocks unauthorized writes.
6. Run the database security checker and review every finding related to the new objects.
7. Regenerate application database types so the repository reflects the new schema; do not wire them into pages yet.
8. Verify protected tables, their row counts/policies, and all existing server functions are unchanged.
9. Record the migration in the repository and stop. No content migration, framework migration, visual change, or publish.

## Explicitly deferred

- Moving `site_settings` values and the one current custom dark-logo object
- Seeding developer media defaults from bundled assets
- Rewriting Settings, homepage, About, or branding readers
- TanStack Start framework conversion
- SEO/Helmet replacement
- Analytics router adaptation
- Removing `site_settings`
- Publishing

These begin only in later separately reviewed phases after the Phase 2 live-schema checks pass.