# Context signal

Last updated: 2026-05-20 16:23 MST

Reload context before future Netlify, billing, support, CMS publish, deployment, or Bedford backup work.

Recently touched or newly important files:

- `/Users/x/Documents/Codex Projects/Cloudinary/bedford-backup-repeat-procedure.md`
- `/Users/x/Documents/Codex Projects/Cloudinary/backup-run-log-2026-05-14.md`
- `/Users/x/Documents/Codex Projects/Cloudinary/bedford-backup-plan-2026-05-14.md`
- `/Users/x/Documents/Codex Projects/Cloudinary/windows-zip-compatibility-note-2026-05-15.md`
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
- `migration/cms-slug-protection-2026-05-20.md`
- `migration/cms-slug-normalization-2026-05-20.md`
- `static/_redirects`
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
- Existing CMS slug fields are now protected in the admin UI and restored by a
  CMS `preSave` hook. This prevents ordinary editor changes from altering public
  URLs or content relation ids after creation.
- Legacy CMS slug/file-id mismatches were resolved across paintings, articles,
  and art lovers niche articles. One duplicate painting file was removed because
  normalizing it would collide with its artist page. Public URL variants that
  changed as a result are preserved by redirects in `static/_redirects`, and
  `validate-cms-relations.mjs` now enforces slug/file-id equality plus public
  route uniqueness for all slug-bearing CMS collections.
- The first two-archive Bedford backup was completed 2026-05-14/15: client asset/content zip for Jerry and provider-only restore kit for maintainer.
- The repeat procedure documents how to refresh Git/S3, build a client archive without provider operational details, build a provider restore kit without duplicating images, upload only the client zip to Google Drive, and share it restricted to Jerry/Joan.
- Jerry reported Windows could not open the first client zip. Local zip tests passed, so a Windows-compatible replacement was built that keeps images as files but exports CMS content into one clean `cms-content-export.json` instead of raw CMS filenames.
