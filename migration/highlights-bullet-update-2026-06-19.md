# Painting Highlight Bullet Update - 2026-06-19

## Summary

Jerry requested changing existing painting detail-page bullet text from
`Professionally conserved and framed` to `Only one exists`.

This work also fixed a related sold-page display bug discovered during research:
sold painting pages were still rendering availability/price bullets because
`pages/painting.vue` checked `!this.sold`, but the component exposes the sold
state as the computed value `isSold`.

Hold behavior was intentionally left unchanged. The existing `isSold` computed
value treats only exact `sold` values as sold, so `Hold`/hold statuses continue
to show the normal availability/contact treatment.

## Files Changed

- `cms/paintings/*.json`
  - Replaced 200 exact highlight entries from `Professionally conserved and framed`
    to `Only one exists`.
- `static/admin/config.yml`
  - Updated the default highlight bullet for newly created paintings to
    `Only one exists`.
- `pages/painting.vue`
  - Updated `showHighlights()` to check `!this.isSold` instead of `!this.sold`.

## Validation

- `git diff --check`: passed.
- `node validate-cms-relations.mjs`: passed.
- `yarn run generate`: passed.
- Local generated-page spot checks:
  - Sold sample: `/a_f_king_peaches_grapes_glass.html`
    - SOLD tag renders.
    - Availability/highlight bullets no longer render.
  - Available sample: `/eugenia_shankland_george_washington_patriae_pater.html`
    - Availability/highlight bullets render.
    - `Only one exists` appears in the bullet list.

## Notes

- The iPad painting detail template did not render the `highlights` field, so no
  iPad-specific code change was needed.
- The Nuxt generation still emits existing legacy warnings about webpack version,
  caniuse-lite, bundle size, and some YouTube Shorts/embed IDs. These were not
  introduced by this change.
