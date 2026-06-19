# Custom framing highlight retirement - 2026-06-19

## Request

Jerry said the painting detail bullet `Custom framing available` should never
appear on paintings again, and it should no longer be a default in the CMS.

## Changes

- Removed the `Custom framing available` highlight entry from current painting
  content. Shawn's concurrent CMS commit `10b2a4ee` had already removed it from
  `cms/paintings/eugenia_shankland_george_washington_patriae_pater-html.json`;
  this follow-up removed the remaining entries from:
  - `cms/paintings/edgar_longstaffe_stone_bridge_by_waterfall-html.json`
  - `cms/paintings/edward_chalmers_leavitt_grapes_testing-html.json`
- Removed the CMS default highlight entry from `static/admin/config.yml`.
- Added a painting-page safety filter in `pages/painting.vue` so that retired
  text is not rendered if it is reintroduced with different casing or extra
  whitespace.
- Added validation in `validate-cms-relations.mjs` so future builds fail clearly
  if painting content contains the retired highlight text.

## Validation

- Search confirmed no `Custom framing available` / `custom framing available`
  remains in `cms/paintings` or `static/admin/config.yml`.
- `yarn validate:cms` passed.
- `yarn generate` passed.
- Generated output check confirmed the retired phrase is absent from:
  - `dist/eugenia_shankland_george_washington_patriae_pater.html`
  - `dist/edgar_longstaffe_stone_bridge_by_waterfall.html`
  - `dist/edward_chalmers_leavitt_grapes_testing.html`
  - `dist/admin/config.yml`

## Deployment

Pending push/deploy at time of initial note.
