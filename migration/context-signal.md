# Context signal

Last updated: 2026-05-20 14:30 MST

Reload context before future Netlify, billing, support, CMS publish, or deployment work.

Recently touched or newly important files:

- `migration/netlify-usage-billing-support-analysis-2026-05-13.md`
- `migration/netlify-usage-before-after-timeline-2026-05-13.md`
- `migration/netlify-credit-run-rate-forecast-2026-05-13.md`
- `migration/github-rate-limit-incident-2026-05-13.md`
- `migration/codex-handoff-2026-05-06.md`
- `migration/cms-publish-workflow.md`
- `migration/cms-upload-path-report.md`
- `static/admin/config.yml`
- `static/admin/bedford-publish-site.js`
- `static/admin/bedford-s3-media-library.js`
- `netlify/functions/publish-site.js`
- `netlify/functions/s3-upload.js`
- `validate-cms-relations.mjs`
- `migration/cms-relation-validation-2026-05-20.md`
- `cms/paintings/edgar_longstaffe_stone_bridge_by_waterfall-html.json`
- `cms/artists/e-longstaffe_artwork-html.json`
- `static/admin/config.yml`

Reason:

- Netlify account/API analysis found active use of Netlify Identity, Git Gateway, Functions, Blobs, build hooks, and the custom CMS publish workflow.
- The account/site plan and billing state should be confirmed in the Netlify dashboard because API credit fields and current public pricing do not line up cleanly.
- A before/after timeline now identifies the production image cutover, CMS publish workflow rollout, deploy-count changes, and the limits of API-visible bandwidth history.
- A credit run-rate forecast now treats other Netlify projects as dormant, corrects the old-image-hosting assumption, and estimates Personal/free-plan fit from May 6-13 deploy cadence plus current cycle bandwidth.
- A GitHub rate-limit incident note now documents Joan's Henry Hintermeister error, identifies unauthenticated GitHub API calls in the CMS publish-status function, and records the local code fix plus required `BEDFORD_GITHUB_TOKEN` Netlify env var.
- A CMS relation validation pass now documents and fixes the Edgar Longstaffe
  missing-detail-page issue. The build runs `validate-cms-relations.mjs` before
  Nuxt generation so missing artist/painting relations fail clearly.
