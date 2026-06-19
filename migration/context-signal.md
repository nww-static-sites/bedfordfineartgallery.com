# Context signal

Last updated: 2026-06-19 09:45 MDT

Reload context before future Netlify, billing, support, CMS publish, deployment, or Bedford backup work.

Recently touched or newly important files:

- `migration/netlify-usage-recheck-2026-06-18.md`
- `migration/cms-status-and-featured-gallery-fix-2026-06-18.md`
- `migration/highlights-bullet-update-2026-06-19.md`
- `migration/youtube-url-normalization-2026-06-19.md`
- `components/YouTubeVideo.vue`
- `libs/youtube.js`
- `pages/painting.vue`
- `static/admin/config.yml`
- `cms/paintings/*.json`
- `netlify/functions/publish-site.js`
- `components/Gallery.vue`
- `pages/artists-bios.vue`
- `package.json`
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
- A June 18 Netlify usage recheck found the current June 15-July 15 cycle at
  `2.39 GB` bandwidth after about `3.53` days, projecting about `20.3 GB` or
  `406` bandwidth credits for the month. Current-cycle deploy usage is only one
  successful production deploy so far, projecting about `127` deploy credits if
  the run-rate holds. Known projected subtotal before requests/compute is about
  `534` credits, much lower than the May 13 forecast and likely inside the
  Personal plan's `1000` included credits if requests/compute are modest. Free is
  still not realistic because projected bandwidth alone exceeds 300 credits.
- Joan's June CMS `Bad credentials` report was traced to the custom CMS
  publish-status panel using an expired `BEDFORD_GITHUB_TOKEN`, not to the named
  painting saves failing. The named Claudius W. Schreyer and Alfred Augustus
  Glendening edits were present in GitHub and live. `publish-site.js` now retries
  GitHub status checks without the configured token when GitHub returns `Bad
  credentials`, and local function tests returned normal CMS status with a
  deliberately bad token.
- Jerry's red featured box report was traced to build-time/database featured
  selection. `/Artists--Bios.html` now selects nine available paintings daily in
  the browser using the `America/New_York` date, so the red box can rotate
  without a Netlify deploy. Local generated-site browser verification showed
  exactly nine featured tiles and no duplicate featured links in the regular
  grid. The old `set-featured-painting-slugs.mjs` script is no longer run by
  `dev` or `generate`.
- Jerry requested changing painting detail bullets from `Professionally
  conserved and framed` to `Only one exists`. Existing content was rewritten in
  200 painting JSON files and the CMS default was updated. A related
  sold-page bug was fixed in `pages/painting.vue`: `showHighlights()` now checks
  `!this.isSold` instead of `!this.sold`, so sold paintings hide the availability
  bullets. Hold behavior was intentionally left unchanged.
- The Eugenia Shankland page exposed a YouTube embed bug: CMS allowed a
  `youtu.be` share URL, but `vue-lazy-youtube-video` expects
  `www.youtube.com/embed/...`. On click, YouTube resolved the iframe to a normal
  watch URL and blocked it with `X-Frame-Options: SAMEORIGIN`. The shared
  `components/YouTubeVideo.vue` wrapper now normalizes supported YouTube share,
  watch, Shorts, and embed URLs through `libs/youtube.js`, and the CMS hints and
  validation patterns document those accepted URL forms.
- Shawn's June 19 CMS save failure was traced to GitHub's authenticated REST API
  rate limit: `Failed to persist entry: API_ERROR: API rate limit exceeded for
  user ID 935847` at `2026-06-19 12:20:37 UTC`. GitHub user ID `935847` maps to
  `srchulo` / Adam Hopkins, while the current local Codex GitHub token maps to
  `srchulo-nww` and was not near its limit. Netlify API confirms Netlify
  Identity and Git Gateway are enabled for
  `nww-static-sites/bedfordfineartgallery.com`; the error likely came from the
  CMS persistence path through Git Gateway, separate from the custom Publish Site
  button. Details are in
  `migration/github-cms-rate-limit-2026-06-19.md`.
- Fixes applied 2026-06-19: the Netlify Git Gateway service instance was rotated
  to the maintained `srchulo-nww` GitHub token, Netlify `BEDFORD_GITHUB_TOKEN`
  was rotated to the same token, and `static/admin/bedford-publish-site.js` now
  coalesces overlapping status checks and throttles non-forced focus/visibility
  refreshes to once per minute. A fresh deploy is needed for the Function env var
  rotation and admin script change to reach production.
