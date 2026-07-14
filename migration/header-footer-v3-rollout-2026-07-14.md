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
  `static/images/bedford-fine-art-gallery-logo.png`.
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

## Deployment state

The public Netlify Deploy Preview and pull request are pending. Production has
not been changed.

