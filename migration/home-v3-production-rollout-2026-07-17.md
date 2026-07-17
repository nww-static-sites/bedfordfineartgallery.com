# Bedford V3 Homepage Production Rollout - 2026-07-17

## Objective

Replace only the production Nuxt homepage content with the client-approved V3
design. Keep the already-live shared header/footer, CMS data model, Netlify
Functions, iPad app, admin, and every non-home public route unchanged.

## Clean Source Boundary

- Worktree: `/Users/x/Documents/Codex Projects/Cloudinary/bedford-home-v3-rollout-2026-07-17`
- Branch: `codex/home-v3-rollout-2026-07-17`
- Starting commit: `ed3bab7eaacabcdc4c3c1823235a83d185b8d50b`
- Starting commit matches both `origin/main` and the production deploy marker.
- The older dirty checkout is not being used for implementation or deployment.

## Production Baseline

Captured with cache-busted requests on 2026-07-17 before source edits:

| Route | Status | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `/` | 200 | 432852 | `ccbc1f005222adcacdfec5f9351a2d82111b191059594b904bdcd81f63f41d4d` |
| `/Artists--Bios.html` | 200 | 166647 | `4208c84d500e10d596571582be56b23fefd48d2b204279ffafa172ad2b3eab81` |
| `/ipad/` | 200 | 411899 | `b75fd98c67b90089e4210d8d8acaa3737ec4cd13bb64438af0138dc35fc63820` |
| `/admin/` | 200 | 779 | `e54eaa1ceff886b5ad229da0289e11d3a4ae4d67f8f839504f7b9fd22694916f` |
| `/george_t_hetzel_artist.html` | 200 | 51016 | `8cb56a6114f5c39079d2e17d8ac8a014407b721c0890a10e054e6822d5dd1409` |

## Integration Rules

1. Replace `pages/index.vue` only at the page ownership boundary.
2. Add homepage-only Vue components with namespaced `bfa-home` classes.
3. Continue loading current testimonials, sold paintings, and featured inventory
   from Nuxt Content so CMS publishing remains authoritative.
4. Do not copy the standalone review frame, preview mutation scripts, broad
   selector overrides, or startup/hydration patches into production.
5. Do not edit `HeaderDefault.vue` or `FooterDefault.vue` unless a verified
   integration defect requires it.
6. Build a full production-equivalent static artifact, run route validation,
   test a deploy preview, and promote that verified source only after all checks
   pass.

## Rollback

The immediate source rollback is the merge-parent commit above. The immediate
hosting rollback is the production deploy serving that same commit. Preserve the
deploy ID in the final promotion record before production is changed.

## Implementation

- Replaced the legacy homepage-only implementation with `HomeRedesign.vue` and
  small homepage-owned components for image marquees, testimonial fading,
  responsive YouTube embeds, and the full-width press marquee.
- Kept `HeaderDefault.vue` and `FooterDefault.vue` unchanged.
- Kept testimonial, sold-painting, and featured-artwork content sourced from the
  existing Nuxt Content/CMS data.
- Added opt-in lazy rendering to `SoldPaintingsMarquee.vue`; its default remains
  unchanged for every non-home consumer.
- Removed the standalone review frame and all legacy homepage mutation scripts,
  broad selector patches, and third-party carousel behavior from the production
  integration.

## Local Verification

Final clean generation completed on 2026-07-17 in 65.16 seconds.

- ESLint passed for every edited Vue file.
- `git diff --check` passed and `yarn.lock` is unchanged.
- CMS relation validation passed: 403 artists, 876 paintings, 153 articles, and
  106 Art Lovers' Niche articles.
- Generated-route validation passed: 2,427 files, including all 876 public iPad
  painting routes.
- Final generated homepage: 157,619 bytes.
- Final generated homepage SHA-256:
  `4791972da3cac12e913f335a079f80a39dc3a1861d19f8cceb71ba2f9e915f4c`.
- Required section, shared-header, shared-footer, and video markers are present;
  retired review buttons, section-number controls, and preview-only classes are
  absent.
- Safari Technology Preview desktop and 390x844 mobile reviews passed. The
  mobile Read More control was independently expanded and collapsed; it no
  longer clips and the following section retains its styling.

## Promotion Record

Pending Deploy Preview and production promotion.
