# Settings admin panel moved onto the new content tables

Goal: what Patrick edits in Settings must actually change the public pages. Today Settings still writes to the old wide `site_settings` row, while the public pages already read from the new `page_text` / `page_media` tables — so his edits would silently do nothing after publishing.

The admin screens stay visually identical: same three tabs, same fields, same order, same buttons, same wording.

## My recommendation: split into two steps, not one

I read the whole Settings screen (967 lines) and the save hook. The Brand and Homepage tabs are a mechanical swap — flat fields, one row per field, no ordering. The About tab is not: the partner list is stored as numbered slots (`partner.01.name`, `partner.01.url`, `partner.01.description`, `partner.01.logo`), so add / remove / reorder has to rewrite the numbering and delete the trailing rows that the new, shorter list no longer uses. That is the only part that can leave the About page in a broken half-state if it goes wrong.

Splitting also gives a clean rollback point: if step B misbehaves, Brand and Homepage are already correct and unaffected.

Both steps are verified in the preview against the live public pages before moving on. Nothing is published, and the old `site_settings` table is not deleted in either step — it stays as the safety net.

## Step A — Brand tab + Homepage tab

Fields written to the new tables:

- Brand → `global`: site name, logo, dark-background logo, favicon
- Homepage → `home`: small line, headline, subline, button label, quote, quote attribution, hero image

Behaviour preserved exactly: an empty field falls back to the built-in default wording shown in grey, uploading an image saves immediately, Replace/Remove work the same, and removing an image brings the built-in default back.

One extra fix in this step: the browser-tab favicon is currently read from the old table, so it also needs to come from the new one, otherwise an uploaded favicon would stop appearing.

New images upload to the `page-media` library; existing images already stored elsewhere keep working untouched, because each stored image remembers its own location.

Verify before moving on: change each Brand and Homepage field in the admin panel, reload the public homepage, confirm the change is there in the server-rendered page; clear a field and confirm the default returns; upload and remove logo, dark logo, favicon and hero image.

## Step B — About tab, including partners

Text fields → `about`: header eyebrow and title, Our Story label/heading/two paragraphs/pull-quote/attribution, leader name and role, promise label/heading/paragraph, partners label and heading. Images → `about`: header photo, Our Story photo, leadership portrait.

Partners get careful handling:

- Adding a partner appends the next number in sequence.
- Removing a partner in the middle renumbers everything after it, with no gaps.
- Reordering rewrites the numbers in the new visual order.
- Saving deletes any leftover numbered rows above the new count, so a removed partner cannot reappear.
- A partner with an empty name is skipped on save, exactly as today.
- Partner logos upload to the image library and are saved as that partner's numbered logo entry.

The save is written so the About page is never left half-updated: the whole set of partner rows is replaced in one operation.

Verify before reporting done: edit every About text field and confirm it on the live About page; add a third partner, reorder, delete the middle one, save, reload, and confirm the public page shows exactly the expected partners in the expected order with no ghost entries; upload and remove all three About images and a partner logo.

## Technical notes

- Writes go through a new admin hook using the `is_admin()`-protected policies already in place on `page_text` and `page_media`. `page_media_defaults` is developer-only and is not written from this screen.
- Uploads use a new `page-media` uploader that reuses the existing image resizing/encoding presets unchanged, and records `bucket` correctly on each row so mixed-bucket history keeps resolving.
- Reads in the admin screen switch from `useSiteSettings()` to the same `fetchContent()` / resolver the public pages use, so admin and site can't drift.
- Partner writes are applied as a single delete-then-insert of the `partner.*` slots for the `about` page, keeping ordinality contiguous for `collectPartners()`.
- `site_settings` and its hook stay in place; a later cleanup step can retire them once both tabs are proven.
