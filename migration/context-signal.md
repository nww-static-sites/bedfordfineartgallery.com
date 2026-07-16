# Context signal

Last updated: 2026-07-15 03:27 MDT

Reload context before future Netlify, billing, support, CMS publish, deployment, or Bedford backup work.

Recently touched or newly important files:

- `migration/netlify-build-efficiency-and-route-reliability-2026-07-14.md`
- `netlify.toml`
- `scripts/netlify-ignore-build.mjs`
- `scripts/verify-deploy.mjs`
- `netlify/plugins/post-deploy-smoke/`
- `modules/cx-stable-content.js`
- `validate-generated-routes.mjs`
- `cms/artists/george_t_hetzel_artist-html.json`
- `pages/artist-bio.vue`
- `migration/header-footer-v3-rollout-2026-07-14.md`
- `components/HeaderDefault.vue`
- `components/FooterDefault.vue`
- `static/images/bedford-fine-art-gallery-logo-v3-250.png`
- `migration/netlify-usage-recheck-2026-06-18.md`
- `migration/cms-status-and-featured-gallery-fix-2026-06-18.md`
- `migration/highlights-bullet-update-2026-06-19.md`
- `migration/custom-framing-highlight-retirement-2026-06-19.md`
- `migration/shipping-audio-replacement-research-2026-06-19.md`
- `migration/sold-painting-home-banner-research-2026-06-23.md`
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

- An isolated branch now removes repeat-build churn, preserves Nuxt's webpack
  cache, validates all 2,427 expected generated public files, adds conservative
  documentation-only build skipping, and adds post-deploy smoke verification.
  Two same-commit local generations produced 7,611 byte-identical files. A
  three-run stable-path proof showed that changing only the deploy identity
  changes exactly the homepage and Artists/Bios HTML files, rather than every
  route payload. The
  same branch repairs the missing `/george_t_hetzel_artist.html` route using the
  existing George T. Hetzel biography and both painting records. Production is
  unchanged. Pull request 3813 and its Deploy Preview are active. The Netlify
  post-deploy plugin and an independent verifier pass the representative site,
  iPad, George T. Hetzel, sitemap-preservation, and production-isolation checks.
  A preview-only HTTP 500 was traced to the production NextLead API receiving a
  Deploy Preview page-load event; production analytics now initializes only on
  the canonical Bedford hostname. A live documentation-only commit was canceled
  by Netlify's ignore command in about 3.1 seconds without generation or
  publication. A separate documentation-only commit pushed while the PR title
  contained `[skip netlify]` created no Netlify deploy record or GitHub Netlify
  status; the normal PR title was restored. Final desktop and mobile browser
  checks passed, including the corrected logo, shared header/footer, George T.
  Hetzel page with both painting links, and the public iPad index. Production
  remains unchanged.
- A follow-up legacy CMS compatibility audit found no changes to the admin CMS,
  Git Gateway configuration, custom Publish Site UI, S3 upload UI, or either
  Netlify Function. A historical real CMS painting save passed through the new
  ignore command as site-affecting and required a build. The Deploy Preview
  serves the admin assets, contains the Identity and publish-script markers,
  deploys both Functions, and returns the expected 401 from the publish status
  Function without authentication. An authenticated publish click was not used
  because it would start an actual production build.
- Production-state verification on 2026-07-15 confirmed PR 3813 is still open
  and unmerged. GitHub `main` and Netlify production both remain on `e248614d`,
  the earlier shared header/footer rollout. Production lacks the new deploy
  marker and the George T. artist route remains 404. Consequently, the live CMS
  Publish Site button is still using the old production build setup; PR 3813
  must be merged and successfully built before the new reliability/efficiency
  setup becomes live.
- Jerry approved V3 as the visual reference for future rollout work. The first
  rollout stage ports only the shared V3 header and footer into the current
  production codebase on an isolated preview branch. The existing homepage
  body and all other page content remain unchanged. Pull request 3811 created
  the successful public Netlify Deploy Preview at
  `https://deploy-preview-3811--stupefied-ramanujan-ca1b24.netlify.app/`.
  Local and deployed desktop/mobile browser QA passed. Production must not
  change until the user explicitly approves the Deploy Preview. Details are in
  `migration/header-footer-v3-rollout-2026-07-14.md`.
- User review found that the first header/footer rollout preview still packaged
  the legacy 123 x 124 logo bitmap. The intended `logo_fullsize.png` source was
  restored and resized to 250 x 252 for the shared header, with the approved V3
  rendered size preserved. The V3 preview workspace source copies were also
  restored so a future preview build cannot overwrite the corrected asset with
  the legacy file again. Deploy Preview 3811 now serves the corrected 250 x 252
  asset from a cache-safe filename; desktop and mobile browser QA passed.
- The user completed review of Deploy Preview 3811 and explicitly approved the
  shared V3 header/footer rollout for production on 2026-07-14. This approval
  does not include the V3 homepage content area, which remains deferred.
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
- Commit `79215dd9` deployed successfully to production via Netlify deploy
  `6a3569fce842340008a87cc1`, ready at `2026-06-19T16:14:48.860Z`. Live checks
  confirmed `/admin/`, `/Artists--Bios.html`, and the deployed admin script.
- Gallery tile distortion on `/Artists--Bios.html` was fixed in
  `components/GalleryTile.vue` by changing `.artist_gallery_image` from
  `object-fit: fill` to `object-fit: contain`, adding centered positioning, and
  adding a dark `#222222` tile background. Details are in
  `migration/gallery-tile-image-fit-2026-06-19.md`.
- Commit `a5e41e34` deployed successfully to production via Netlify deploy
  `6a356e73b0a5dd0008113399`, ready at `2026-06-19T16:33:48.874Z`. Live browser
  verification confirmed `/Artists--Bios.html` gallery tiles compute as
  `object-fit: contain` with centered positioning and dark tile background.
- Follow-up commit `6282bf4e` changed the gallery tile letterbox background from
  pure black to page-matching `#222222`. Netlify deploy
  `6a35704384e43f00083fca1c` was ready and published at
  `2026-06-19T16:41:15.920Z`; live browser verification confirmed
  `background-color: rgb(34, 34, 34)`.
- Jerry requested retiring the painting bullet `Custom framing available`.
  Current painting content entries were removed, the CMS default was removed,
  `pages/painting.vue` now filters that retired text if it sneaks back in, and
  `validate-cms-relations.mjs` now fails clearly if painting content contains it.
  Commit `bb4b1642` deployed successfully to production via Netlify deploy
  `6a357839b489a4000801af40`, ready/published at
  `2026-06-19T17:15:31.376Z`. Live checks confirmed the retired text is absent
  from affected painting pages and `/admin/config.yml`. Details are in
  `migration/custom-framing-highlight-retirement-2026-06-19.md`.
- Shipping audio research found the current site audio player in both
  `pages/index.vue` and `pages/painting.vue`, both pointing at
  `static/images/luvvoice.com-20251201-j23UN4.mp3`. The current MP3 is mono,
  24 kHz, 48 kbps and about 442K. The exact script text is not stored in repo;
  get/verify the transcript before generating replacement candidates. Details
  are in `migration/shipping-audio-replacement-research-2026-06-19.md`.
- A dry-run male OpenAI TTS preview was generated outside the repo at
  `/Users/x/Documents/Codex Projects/Cloudinary/audio-previews/bedford-shipping-options-dry-run-male-2026-06-19.mp3`
  and uploaded to Drive:
  `https://drive.google.com/file/d/1t4TYvkHS3zkApxqOWtE1ofRP9d0x1sUR/view?usp=drivesdk`.
  No website files were changed.
- A second, cheerier male dry-run preview was generated outside the repo at
  `/Users/x/Documents/Codex Projects/Cloudinary/audio-previews/bedford-shipping-options-dry-run-male-cheerful-2026-06-19.mp3`
  and uploaded to Drive:
  `https://drive.google.com/file/d/1iSTNx5NuWxai4lSdP52LUwT3X3MdQ3O8/view?usp=drivesdk`.
  It uses `gpt-4o-mini-tts` voice `echo` and supersedes the too-serious first
  preview for client review unless another direction is requested.
- Jerry approved the cheerier `echo` preview on 2026-06-21. The approved MP3
  was copied into `static/images/bedford-shipping-options-voiceover-2026-06-21.mp3`,
  and the audio players in `pages/index.vue` and `pages/painting.vue` now point
  to `/images/bedford-shipping-options-voiceover-2026-06-21.mp3`. The old
  `luvvoice.com-20251201-j23UN4.mp3` file was left in place for stale cached
  pages or direct old links.
- Commit `e8d0c6ed` deployed successfully to production via Netlify deploy
  `6a3875a1c8b6d2000892c6e3`, ready/published at 2026-06-21 17:41 MDT. Local
  generate passed, local and live HTML checks confirmed the home page and a
  painting detail page use the new audio URL, and the live MP3 matched the local
  committed MP3 by SHA-256.
- Research on 2026-06-23 found the home page sold carousel is currently the two
  divs `.homeSoldSlidingImagesMobile` and `.homeSoldSlidingImagesDesktop`, which
  render hard-coded composite-image components. Those 21 composite JPGs total
  about 11.03 MB. The CMS has 689 sold paintings, 688 with `gridImage`, and no
  sold-date field. Recommended plan: preview a new home-page-only responsive
  sold-painting marquee on a feature branch/Netlify Deploy Preview, selecting
  100 deterministic daily-random sold thumbnails client-side from CMS data.
  Details are in `migration/sold-painting-home-banner-research-2026-06-23.md`.
- Preview-only implementation started on branch
  `codex/sold-marquee-preview-2026-06-23` on 2026-06-23. Latest `origin/main`
  was merged into the branch before implementing. The branch adds
  `libs/daily-random.js`, `components/SoldPaintingsMarquee.vue`, updates
  `components/Gallery.vue` to share the deterministic daily random helpers, and
  replaces the home page's two old sold composite-image divs in `pages/index.vue`
  with one responsive marquee fed by CMS sold paintings. Local `yarn run generate`
  passed; generated `dist/index.html` has 100 unique sold paintings duplicated
  once for scrolling and 0 old `sold_grid_carousel` references. This is for a
  Netlify Deploy Preview only; do not merge to `main` until approved.
- PR `https://github.com/nww-static-sites/bedfordfineartgallery.com/pull/3810`
  created for the sold-painting marquee preview. Netlify deploy preview
  `https://deploy-preview-3810--stupefied-ramanujan-ca1b24.netlify.app/` is
  ready from deploy ID `6a3afef71823790009f25b84` at commit `d33bf95d`. Preview
  checks passed: HTTP 200, 100 unique sold paintings duplicated for scrolling,
  0 old composite carousel refs, 0 links inside the sold marquee, and sampled
  preview image URLs returned HTTP 200. Production home page still had the old
  carousel at the time of verification, confirming the live site was not changed.
- User review of preview 3810 found a black-strip repaint glitch and speed
  inconsistency in the sold marquee. Follow-up on the same preview branch
  reworked `components/SoldPaintingsMarquee.vue` to render a small visible
  rotating window of sold paintings instead of one enormous transformed
  duplicated strip, preload the selected daily images, and advance at a steady
  step speed. `pages/index.vue` now groups the sold header, intro paragraph, and
  scroller in a single dark `#222` rounded panel in the requested order: header,
  paragraph, scroller. Local generate passed; local browser verification showed
  the row advancing for about 44 seconds with loaded visible images and a much
  smaller ~1950px animated track.
- Follow-up commit `a7deebd8` deployed to PR 3810 preview at
  `https://deploy-preview-3810--stupefied-ramanujan-ca1b24.netlify.app/` via
  Netlify deploy ID `6a3b03a59119510008eccdf5`, state `ready`. Remote checks
  passed: HTTP 200, requested section order, dark panel CSS, 14 SSR row tiles,
  0 old composite refs, small ~1950px animated track in browser, visible images
  loaded, and row advanced over time. Production home page remained unchanged
  with the old 21 composite refs at verification time.
- Second user review requested visual polish on the same preview branch: 20px
  panel radius, bold sold header, centered 70%-wide paragraph wrapper with
  left-aligned text, and tiny upper-left `SOLD` badges on each scroller tile.
  Local generate passed and generated HTML checks found the expected styling and
  badge markup with 0 old composite refs.
