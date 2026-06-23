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
