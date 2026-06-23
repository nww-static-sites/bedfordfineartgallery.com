# Sold Painting Home Banner Research - 2026-06-23

## Request

Replace the current sold-painting carousel on the home page with an automated
daily random display of 100 sold paintings. This is research/planning only.
Implementation should happen first in a preview of the home page, not directly
on production.

## Current Implementation

The live home page section is in `pages/index.vue`:

- `.homeSoldSlidingImagesMobile` renders `components/SoldSlidingImagesMobile.vue`.
- `.homeSoldSlidingImagesDesktop` renders `components/SoldSlidingImages.vue`.

The desktop component hard-codes 7 composite JPGs:

- `sold_grid_carousel_1_1400.jpg` through `sold_grid_carousel_7_1400.jpg`

The mobile component hard-codes 14 composite JPGs:

- `sold_grid_carousel_mobile_1_800.jpg` through
  `sold_grid_carousel_mobile_14_800.jpg`

Those 21 files total about `11.03 MB` by HTTP `Content-Length`, before counting
the rest of the home page. The first image in each component is not marked lazy;
the remaining images are marked `loading="lazy"`, but both mobile and desktop
components are rendered into the page and hidden only by CSS media queries.

The same two old sold components are also used by:

- `pages/customer-images-loop.vue`
- `pages/index-old-april24.vue`

For a home-page-only preview, do not edit the shared old components directly.
Introduce a new component and wire it into the preview home page only.

## CMS Data Findings

Current local CMS counts:

- Total painting JSON files: `873`
- Sold paintings: `689`
- Sold paintings with `gridImage`: `688`
- Sold paintings with `mediumResImage`: `689`
- Sold paintings with stored `gridImageWidth`/`gridImageHeight`: `568`
- Sold paintings with a `soldDate` or similar date field: `0`

The single sold painting missing `gridImage` is:

- `cms/paintings/george_t_hetzel_for_later-html.json`
- Title: `For Later`
- It does have `mediumResImage`, but the first implementation should simply
  filter out entries missing `gridImage` unless Jerry specifically wants it
  included with a fallback.

There are no duplicate `gridImage` URLs among sold paintings.

Estimated data cost for passing all sold thumbnail records into the home page:

- `688` records with `slug`, `title`, `gridImage`, dimensions, and alt text are
  about `167 KB` uncompressed JSON in the Nuxt payload.

Sampled image weights:

- Deterministic daily sample of 100 sold `gridImage` URLs for 2026-06-23: `5.18 MB`
  total by HTTP `Content-Length`.
- Average sampled grid image: about `53 KB`.
- Median sampled grid image: about `38.7 KB`.
- 90th percentile: about `107 KB`.
- Max sampled image: about `134 KB`.

The custom image host `https://img.bedfordfineartgallery.com` did not accept
Cloudinary-style transformation URLs such as `c_fill,w_220,h_150,f_auto,q_auto`,
so the first low-risk implementation should use existing `gridImage` URLs.

## Recommended Implementation Plan

1. Create a feature branch and PR for Netlify Deploy Preview review. Do not push
   this directly to `main`.
2. Add a reusable daily-selection helper, ideally extracted from the existing
   deterministic daily featured-gallery logic in `components/Gallery.vue`:
   - `easternDateKey()`
   - `hashString()`
   - `seededRandom()`
   - `dailyRandomSelection(items, count, seedParts)`
3. Add `components/SoldPaintingsMarquee.vue`:
   - Takes sold painting thumbnail records as a prop.
   - Filters out records without `gridImage`.
   - Selects 100 deterministic daily-random records using the America/New_York
     date and the sorted sold slug list.
   - Renders one responsive scrolling row instead of separate desktop/mobile
     composite-image carousels.
   - Duplicates the selected list in the visual track for a seamless loop.
   - Does not wrap images in links.
   - Uses decorative image alt text (`alt=""`) or a concise outer label so
     screen readers are not forced through 100 sold painting titles.
   - Uses `loading="lazy"` and `decoding="async"` for images.
   - Uses CSS animation with `prefers-reduced-motion` fallback.
4. In `pages/index.vue`, fetch sold thumbnail records in `asyncData`, for example
   directly from `$content('paintings')` with:
   - `slug`
   - `title`
   - `gridImage`
   - `gridImageWidth`
   - `gridImageHeight`
   - `mainImageAltText`
   - `status`
5. Replace the two home page divs:
   - `.homeSoldSlidingImagesMobile`
   - `.homeSoldSlidingImagesDesktop`

   with a single responsive `SoldPaintingsMarquee` instance on the preview
   branch.
6. Leave `SoldSlidingImages.vue` and `SoldSlidingImagesMobile.vue` untouched for
   now, because they are also used by old/secondary pages.

## Preview Strategy

Preferred preview path:

1. Implement on a feature branch.
2. Open a GitHub PR.
3. Let Netlify create a deploy preview.
4. Share the Netlify preview home page URL for review.
5. Only merge/push to production after approval.

Alternative preview path if a PR preview is not desired:

- Add a separate preview-only route such as `/sold-carousel-preview.html` that
  uses the home page layout plus the new component. This avoids changing even
  the preview deployment's root page, but it is more throwaway code.

## Testing Plan

Before sharing preview:

- Run `yarn run generate`.
- Confirm CMS validation passes.
- Confirm exactly 100 unique sold paintings are selected for today's date.
- Confirm no anchors are rendered inside the sold banner.
- Confirm the selected set changes for a simulated next-day date.
- Confirm desktop shows roughly 5-6 paintings at once.
- Confirm mobile shows roughly 3 paintings at once.
- Confirm the banner scroll is smooth and does not obscure adjacent text.
- Confirm `prefers-reduced-motion` stops animation or provides usable horizontal
  scrolling.
- Use browser/network checks on the deploy preview:
  - New page does not load the 21 old composite JPGs.
  - New page loads the daily selected grid images.
  - The initial load is materially lighter than the current composite carousel.

## Open Decision

Because the CMS has no sold-date field, the approved "100 random daily" rule is
straightforward. But "newly sold paintings always appear immediately" is not
guaranteed; new sold items enter the eligible pool after publish, then have a
100/688-ish chance of appearing on a given day. Guaranteeing immediate inclusion
would require adding a `soldDate`/`dateSold` field or using a different rule.

## Preview Implementation - 2026-06-23

User approved preview-only implementation of the 100 random daily sold-painting
marquee.

Implementation branch: `codex/sold-marquee-preview-2026-06-23`.

The branch was updated with latest `origin/main` before implementation. Current
CMS counts after the merge:

- Total painting JSON files: `876`
- Sold paintings: `689`
- Sold paintings with `gridImage`: `688`

Implemented changes:

- Added `libs/daily-random.js` to share the deterministic America/New_York daily
  random helpers with the existing featured-gallery logic.
- Updated `components/Gallery.vue` to import the shared helpers instead of
  keeping duplicate local versions.
- Added `components/SoldPaintingsMarquee.vue`.
- Updated `pages/index.vue` to fetch sold painting thumbnail records and render
  the new marquee in place of `.homeSoldSlidingImagesMobile` and
  `.homeSoldSlidingImagesDesktop`.
- Left `components/SoldSlidingImages.vue` and
  `components/SoldSlidingImagesMobile.vue` untouched because old/secondary pages
  still reference them.

Verification:

- `yarn run generate` passed.
- Generated `dist/index.html` contains `200` marquee item nodes: 100 unique
  sold paintings duplicated once for the seamless loop.
- Generated `dist/index.html` has `0` references to old
  `sold_grid_carousel...` composite images.
- `git diff --check` passed.

Deployment intent:

- Push this branch and open a PR only to obtain a Netlify Deploy Preview.
- Do not merge to `main` or production until the preview is reviewed and
  approved.

## Deploy Preview Result - 2026-06-23

PR: `https://github.com/nww-static-sites/bedfordfineartgallery.com/pull/3810`

Preview URL:
`https://deploy-preview-3810--stupefied-ramanujan-ca1b24.netlify.app/`

Netlify deploy:

- ID: `6a3afef71823790009f25b84`
- Context: `deploy-preview`
- State: `ready`
- Commit: `d33bf95dfd017f77529eb6833f9d076e79fec4e3`

Live production was not changed. Verification after Netlify preview was ready:

- Preview home page returned HTTP 200.
- Preview home page contains `200` marquee image nodes: 100 unique selected sold
  paintings duplicated once for continuous scrolling.
- Preview home page contains `0` old `sold_grid_carousel...` composite image
  references.
- Production home page still contains the old carousel: `21`
  `sold_grid_carousel...` references and `0` new marquee nodes.
- The sold marquee section contains `0` anchor tags, so the scrolling sold images
  are not clickable.
- Sampled 12 selected image URLs from the preview marquee; all returned HTTP 200.

## Preview Review Follow-Up - 2026-06-23

User reviewed deploy preview 3810 and reported:

- Safari/browser display glitch: the marquee became a black strip after running
  for a while, then repainted when the mouse moved over it or when the animation
  restarted.
- Motion felt slow at first, then faster after images loaded.
- The sold intro paragraph, all-caps sold header, and sold scroller should be one
  visual section in this order: header, paragraph, scroller.
- The combined section should sit inside a rounded dark gray rectangle with
  white text.

Follow-up implementation:

- Reworked `components/SoldPaintingsMarquee.vue` to avoid one enormous
  transformed track. It now renders only enough visible tiles plus a buffer, then
  rotates through the daily 100 selected paintings one step at a time.
- The browser preloads the selected daily image URLs and starts animation after
  the initial visible images load or a short fallback timer.
- The old CSS keyframe animation over the full duplicated 100-painting strip was
  removed.
- Reordered `pages/index.vue` so the section is header, paragraph, scroller.
- Added `.home_sales_panel` styling: dark `#222` rounded panel, white text, and
  panel padding around all three elements.

Local verification:

- `yarn run generate` passed.
- Generated `dist/index.html` contains `14` SSR marquee tiles, not the previous
  huge `200`-node strip.
- Generated `dist/index.html` contains `0` old `sold_grid_carousel...` composite
  image references.
- Local browser check confirmed the rendered row track was about `1950px` wide
  at a 1280px viewport, versus the previous approximately 35,000px moving strip.
- Local browser check confirmed the panel order, `#222` panel background, 8px
  border radius, and white paragraph text.
- Local browser watch over roughly 44 seconds confirmed the row kept advancing
  and all visible images were loaded.

Updated deploy preview:

- Commit: `a7deebd8bcc2e74801254b75981b91c13f84fb79`
- Netlify deploy ID: `6a3b03a59119510008eccdf5`
- Preview URL:
  `https://deploy-preview-3810--stupefied-ramanujan-ca1b24.netlify.app/`

Remote preview verification:

- Netlify deploy reached `ready`.
- Preview home page returned HTTP 200.
- Preview HTML contains `14` SSR marquee items, `0` old
  `sold_grid_carousel...` references, the dark panel CSS, and the requested
  order.
- Production home page still had `21` old composite refs and no new panel,
  confirming live production was not changed.
- Browser verification against the deployed preview confirmed the dark `#222`
  panel, white text, 8px radius, small approximately `1950px` animated row, and
  loaded visible images.
- Remote browser watch over roughly 10 seconds confirmed the first visible
  painting changed multiple times and the row kept advancing.

## Second Preview Review Follow-Up - 2026-06-23

User approved the revised preview direction and requested small visual tweaks:

- Increase the panel border radius to about `20px`.
- Make the "Some notable sales..." header bold.
- Put the paragraph inside a centered approximately 70%-wide wrapper and
  left-align the paragraph text inside it.
- Add a tiny upper-left `SOLD` badge overlay on each scroller painting, inset
  about 4px.

Implementation:

- `pages/index.vue` now uses `.home_thumbnails_wrap` at `width: min(70%, 900px)`
  with the paragraph left-aligned inside it; the wrapper falls back to 100% on
  small screens.
- `.home_sales_panel` border radius changed from 8px to 20px.
- `.home_sales .reverse_header` is explicitly bold.
- `components/SoldPaintingsMarquee.vue` renders a tiny `SOLD` badge per visible
  tile with white translucent background and red bold text.

Local verification:

- `yarn run generate` passed.
- Generated `dist/index.html` includes the 20px panel radius, 70% paragraph
  wrapper, left-aligned paragraph text, bold header styling, visible `SOLD`
  badge markup, and `0` old `sold_grid_carousel...` references.
