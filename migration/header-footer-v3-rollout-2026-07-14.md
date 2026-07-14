# V3 header and footer rollout

Date: 2026-07-14

## Decision

Jerry approved the V3 homepage redesign as the visual reference for future
rollout work. The first production-site stage is intentionally limited to the
shared site header and footer.

## Scope

- Port the approved V3 header into `components/HeaderDefault.vue`.
- Port the approved V3 footer into `components/FooterDefault.vue`.
- Serve the improved Bedford logo locally from
  `static/images/bedford-fine-art-gallery-logo-v3-250.png`.
- Preserve the fixed Art Lovers' Niche newsletter link.
- Add a simple mobile navigation toggle to the shared header.
- Remove the payment-card artwork from the shared footer.
- Keep the footer phone number as an unstyled `tel:` link.

## Explicit non-scope

- Do not port any V3 homepage content sections.
- Do not change `pages/index.vue` or other page-body components.
- Do not merge or publish to production without a separate user approval.

## Branch and worktree

- Branch: `codex/header-footer-v3-preview-2026-07-14`
- Clean worktree:
  `/Users/x/Documents/Codex Projects/Cloudinary/bedford-header-footer-v3-preview`
- Base: current `origin/main` at setup (`a6749710`)

## Local verification

- `yarn install --frozen-lockfile`: passed.
- `NUXT_TELEMETRY_DISABLED=1 yarn generate`: passed.
- CMS relation validation passed for 403 artists, 876 paintings, 153 articles,
  and 106 Art Lovers' Niche articles.
- `git diff --check`: passed.
- Browser QA passed on the existing homepage and `/Artists--Bios.html`.
- Desktop QA at 1280 x 900 confirmed full-width `#61211d` header/footer, the
  100px local logo, horizontal navigation, no payment cards, and unchanged
  homepage content.
- Mobile QA at 390 x 844 confirmed no new horizontal overflow, a working
  open/close navigation toggle, stacked footer content, and sufficient footer
  padding to keep the legal copy clear of the fixed newsletter link.

## Logo correction

The first preview commit accidentally packaged the legacy 123 x 124 logo file
under the new local filename. This was detected during user review on
2026-07-14. The asset was replaced from the intended bucket source,
`https://img.bedfordfineartgallery.com/logo_fullsize.png`, resized to 250 x 252
while preserving its proportions. The header's intrinsic width and height now
match the corrected asset. Its rendered desktop size remains 100px wide, which
matches the approved V3 header layout while giving it the intended sharper
source image. A new public filename prevents browsers or Netlify from reusing
the cached legacy bitmap.

The correction was deployed from commit `ca492bc2`. The public asset returned
HTTP 200 at 250 x 252 and matched the local SHA-256 checksum
`1b64938ced48a38e0e040803060d8d657a8abf9fc7a2d8ac23cc1a3c49faec73`.
Desktop browser QA confirmed a 100px rendered width; mobile browser QA
confirmed a 76px rendered width and no horizontal overflow. The inherited
homepage body remained unchanged.

## Deployment state

- Pull request: https://github.com/nww-static-sites/bedfordfineartgallery.com/pull/3811
- Netlify Deploy Preview:
  https://deploy-preview-3811--stupefied-ramanujan-ca1b24.netlify.app/
- GitHub/Netlify reported the preview build successful, and the preview root
  returned HTTP 200.
- Deployed browser QA repeated the desktop, mobile, menu, local-logo, footer,
  overflow, and unchanged-homepage checks described above. The shared chrome
  also passed on `/Artists--Bios.html`.
- The preview hostname causes the existing NextLead `SITE_LOAD` analytics call
  to return HTTP 500. The same inherited plugin is quiet on the production
  hostname, and the preview error does not affect rendering or navigation. No
  NextLead code was changed in this narrowly scoped rollout.
- The user completed desktop/mobile preview review and explicitly approved the
  header/footer rollout for production on 2026-07-14.
- Production deployment and post-deploy verification are now authorized; the
  V3 homepage content remains explicitly outside this rollout.

Pull request 3811 may now be merged. Verify the production header, footer,
mobile menu, corrected logo asset, and unchanged homepage body after Netlify
reports the production deploy ready.
