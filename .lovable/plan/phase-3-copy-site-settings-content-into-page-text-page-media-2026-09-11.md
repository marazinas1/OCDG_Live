# Phase 3 — Copy site_settings content into page_text / page_media

Copy-only phase. `site_settings` stays untouched, every current reader keeps working, nothing is published.

## What the live data actually contains

I checked the single `site_settings` row before planning. Most columns are empty today, so the migration is much smaller than the full mapping list suggests:

Filled text values (5):
- `site_name` = "Ocean City Development Group"
- `hero_eyebrow` = "Ocean City Development Group"
- `hero_headline` = "Building the Future / of Ocean City"
- `hero_subline` = "Premier Residential Developments & Custom Homes"
- `hero_cta_label` = "View Developments"

Filled image (1):
- `logo_dark_path` = `logo_dark/ocdg-logo-white.png`, physically stored in the **brand-assets** bucket (verified against the storage listing — it is the only object in that bucket).

Partners: exactly **2** entries, each with name, url, description. Both have an empty logo.

Empty (NULL) and therefore intentionally not copied: `logo_path`, `favicon_path`, `hero_image_path`, `home_quote`, `home_quote_attribution`, all three `about_*_image_path` columns, and all 18 `about_*` text columns.

## Expected result

| Table | Rows | Detail |
|---|---|---|
| `page_text` | 11 | 1 global + 4 home + 6 partner (2 partners x name/url/description) |
| `page_media` | 1 | `global / logo_dark`, bucket `brand-assets` |

Deviation from the brief worth flagging: partners produce **3** rows each, not 4, because neither partner has a logo. A `partner.NN.logo` row with an empty path would break the non-empty check on `storage_path` and would be meaningless data.

Slots created:
```text
page_text
  global / site_name
  home   / hero_eyebrow
  home   / hero_headline
  home   / hero_subline
  home   / hero_cta_label
  about  / partner.01.name          Halliday Architects
  about  / partner.01.url           https://www.hallidayarchitects.com/
  about  / partner.01.description   Every Ocean City Development Group project...
  about  / partner.02.name          Halliday-Leonard Custom Home Builders
  about  / partner.02.url           https://www.hallidayleonardllc.com/
  about  / partner.02.description   Our trusted construction partner...

page_media
  global / logo_dark   brand-assets : logo_dark/ocdg-logo-white.png
```

Partner numbering follows the existing array order (Halliday Architects first).

## How it runs

- One data insert through the data-change tool (not a schema migration), written as `INSERT ... SELECT` from `site_settings` with `WHERE column IS NOT NULL` guards and `ON CONFLICT (page, slot) DO NOTHING`, so re-running it is harmless.
- Partner rows are generated from `jsonb_array_each` with ordinality, so the numbering comes from the real array rather than a hardcoded count.
- Image files are **not** moved. The `page_media` row records `bucket = 'brand-assets'` so the file keeps serving from exactly where it lives today. A physical move to `page-media` is optional and belongs to a later, separate step.
- No column, table, policy, or component is dropped or edited.

## Verification I will report back

1. Row counts: `page_text` = 11, `page_media` = 1, matched line by line against the non-null `site_settings` columns.
2. Full listing of every created `(page, slot)` pair with its value (long text truncated) for your review.
3. Confirmation that `site_settings` still has all its columns and its single row, and that no page component was touched.
4. Re-count of `properties` (51), `property_images` (733), `leads` (7), `testimonials` (3), `user_roles` (2) to prove they are unchanged.
5. Public URL check that the dark logo still resolves through the recorded bucket/path.

Nothing is published.
