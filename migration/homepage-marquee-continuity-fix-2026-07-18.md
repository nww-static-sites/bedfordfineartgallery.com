# Homepage Marquee Continuity Fix - 2026-07-18

## Reported Problem

Jerry reported that the happy-customer image marquee on the new production
homepage moved far too quickly, appeared to stop and restart, and paused when
the pointer crossed it. Review also found that the 19th Century artwork and As
Seen In marquees paused on hover. The sold-painting marquee behaved correctly.

## Root Cause

This was not old JavaScript taking control of the page. The customer and
artwork image strips are CSS marquees in `HomeImageMarquee.vue`, and both used
the same fixed 110-second animation duration despite radically different track
lengths.

- The 104-image customer track was about 21,424 pixels long, producing roughly
  194.76 pixels per second on desktop and 233.37 pixels per second on mobile.
- The 10-image artwork track was about 1,860 pixels long, producing roughly
  16.91 pixels per second on desktop and 19.27 pixels per second on mobile.
- Explicit hover and focus CSS rules paused the image and press marquees.
- The fast customer strip could also outrun lazy-loaded images, which made the
  strip appear to disappear and return.

## Repair

- `HomeImageMarquee.vue` now calculates each duration from image count, tile
  width, gap width, and a stable speed target.
- Customer and artwork strips now move at 17 pixels per second on desktop and
  19 pixels per second on mobile, regardless of track length.
- Hover and focus pause rules were removed from `HomeImageMarquee.vue` and
  `HomePressMarquee.vue`.
- The sold-painting marquee was deliberately left unchanged.
- The `prefers-reduced-motion` accessibility behavior remains intact for users
  who explicitly request reduced motion.

Computed production durations:

| Marquee | Desktop | Mobile |
| --- | ---: | ---: |
| Happy customers | 1260.24 seconds | 1007.16 seconds |
| 19th Century artwork | 109.41 seconds | 83.16 seconds |

## Verification

- ESLint passed for both edited Vue components.
- `git diff --check` passed.
- A complete `yarn generate` passed CMS relation validation for 403 artists,
  876 paintings, 153 articles, and 106 Art Lovers' Niche articles.
- Generated-route validation passed all 2,427 expected files, including all 876
  iPad painting routes.
- Safari Technology Preview confirmed slow continuous customer-strip movement
  while the pointer remained over the strip.
- Deploy Preview verification passed representative routes, sitemap
  preservation, production isolation, and the George T. Hetzel routes.
- The preview and live artifacts contain the calculated duration markers and
  no longer contain any of the four image/press hover or focus pause selectors.
- Post-production verification passed the representative homepage, shared
  routes, iPad, admin, privacy, Art Lovers' Niche, notable-sales, category, and
  George T. Hetzel checks.

## Promotion Record

- Pull request: `https://github.com/nww-static-sites/bedfordfineartgallery.com/pull/3816`
- Repair source commit: `2320ed57104563da55c9592cd816494013e1c026`
- Deploy Preview ID: `6a5b243a523bd500085159b8`
- Deploy Preview URL:
  `https://deploy-preview-3816--stupefied-ramanujan-ca1b24.netlify.app`
- Production merge commit: `9a934aa6d9eb6283d5436182f255fa45bf961412`
- Production deploy ID: `6a5b267c7eff6d0007ba4bd9`
- Production published: `2026-07-18T07:12:57.448Z`
- Production URL: `https://www.bedfordfineartgallery.com/`

## Rollback

- Previous production deploy ID: `6a5a121b84c25b0008a8910a`
- Previous production commit: `0444a94d7fe39a37fa79ac44fd8095129626d2bd`
- The previous immutable deploy remains the immediate hosting rollback
  artifact.
