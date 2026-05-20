# CMS relation validation - 2026-05-20

## Issue

Joan added `Stone Bridge by Waterfall` by Edgar Longstaffe. The gallery tile
appeared on `Artists--Bios.html`, but the detail page
`/edgar_longstaffe_stone_bridge_by_waterfall.html` returned a not-found page.

## Root cause

The painting record referenced a stale artist value:

- bad value: `e-longstaffe_landscape-html`
- correct artist entry id: `e-longstaffe_artwork-html`

The old CMS relation fields were configured with `value_field: 'slug'`. That
saved the editable JSON `slug` value from the related entry. For several legacy
artist records, that JSON `slug` field no longer matched the actual content
entry id used by Nuxt Content lookups.

The gallery page tolerated the missing artist relation and rendered the tile
with fallback artist data. The painting detail page directly loaded the artist
entry and failed when the referenced artist id did not exist.

## Fix

- Corrected the Longstaffe painting's `artist` reference to
  `e-longstaffe_artwork-html`.
- Normalized stale artist JSON `slug` fields so they match the artist entry ids.
- Cleaned two stale artist-to-painting references:
  - removed a deleted Edward S. "Tige" Reynolds painting reference
  - corrected William Mason Brown's Orange County painting reference casing
- Updated CMS relation widgets to use `value_field: '{{slug}}'`, which stores
  the CMS entry id instead of an editable JSON slug field.
- Added `validate-cms-relations.mjs` and made `yarn run generate` run it before
  building.

## Validation behavior

The validator fails the build if:

- an artist JSON slug does not match the artist entry id
- an artist references a missing painting entry
- a painting references a missing artist entry
- a painting highlight references a missing paired painting entry

This should prevent future deploys where a gallery tile renders but the painting
detail page is missing because of a broken CMS relation.
