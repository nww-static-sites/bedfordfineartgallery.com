# Netlify build efficiency and route reliability - 2026-07-14

## Status

- Pull request 3813 was merged and the new setup is live in production.
- Production source and deploy are aligned at `1c17e89d` after the controlled
  CMS Publish Site build-hook proof.
- The historical Deploy Preview remains available at
  https://deploy-preview-3813--stupefied-ramanujan-ca1b24.netlify.app/.
- Production rollout details and exact measurements are recorded at the end of
  this note.
- The earlier cache benchmark PR 3812 remains separate and must not be merged.

## Why this work was needed

Four controlled Netlify benchmark builds took 222-261 seconds. Clearing caches did not produce a repeatable improvement. More importantly, repeat builds changed almost every generated HTML and payload file even when the source commit was unchanged. The churn caused needless upload work and made deployment identity harder to audit.

Production also returned HTTP 404 for `/george_t_hetzel_artist.html`, although both George T. Hetzel painting records existed.

## Implemented changes

1. `package.json` no longer deletes `node_modules/.cache` or runs `yarn cache clean --all` before every generation. Nuxt can now reuse its webpack snapshot. Generation uses `--fail-on-error` and runs CMS plus output-route validation.
2. `nuxt.config.js` gives full-static route state a stable `cx-v1` directory instead of Nuxt's current-time default. The site revalidates `/_nuxt/static/*` in visitors' browsers while retaining long immutable caching for content-hashed webpack chunks. Netlify atomically invalidates edge assets per deploy. Sitemap `lastmod` no longer uses the build time.
3. `modules/cx-stable-content.js` compensates for Nuxt Content 1.9's concurrent, timestamped database insertion. Files are parsed in parallel, inserted in stable path order, and volatile Loki creation timestamps are normalized.
4. Testimonial records now use testimonial text as a stable secondary sort key when customer names tie.
5. The generated manifest route array is sorted through Nuxt's supported `generate:manifest` hook.
6. Stale `.nuxt/dist/client/content` database assets are removed before generation without deleting the reusable webpack cache.
7. `validate-generated-routes.mjs` requires 2,427 expected public files: 876 standard painting pages, 876 iPad painting pages, 403 artist pages, 153 article pages, 106 Art Lovers' Niche pages, and representative static routes.
8. `netlify.toml` uses `scripts/netlify-ignore-build.mjs` to skip only documentation-only changes under `migration/` or root AGENTS/README Markdown. Missing/equal refs, failed comparisons, empty comparisons, and all site-affecting changes build conservatively.
9. A local Netlify build plugin runs `scripts/verify-deploy.mjs` after a successful deploy. It verifies representative public routes, V3 shared header/footer markers, deploy commit identity, admin-only Identity loading, sitemap route preservation, production isolation, iPad output, and George T. Hetzel routes.
10. The public Identity widget was removed from homepage variants; it remains on `/admin/` where it belongs. A missing article body no longer crashes preview generation.
11. Generic internal dynamic template routes are removed before concrete CMS routes are registered. This eliminates five meaningless failing generator paths while preserving every real CMS route.
12. The iPad index route now generates real content at `/ipad` instead of a generated 404 document.
13. George T. Hetzel's artist record now contains the existing biographical text and metadata. The artist template falls back across available painting image fields so both of his paintings render. `/george_t_hetzel_artist.html` now generates successfully.
14. The deploy verifier permits removal of four generic template paths only after confirming each remains a production HTTP 404. This cleans dead sitemap entries without weakening preservation checks for real public routes.
15. `scripts/stamp-deploy-ref.mjs` adds the invisible commit marker only to the homepage and Artists/Bios output after generation. This independently proves the new deploy on two pages without forcing every page and payload to change.
16. Production NextLead analytics now initializes only on the canonical Bedford hostname. Deploy Previews no longer send preview page-load events to the production NextLead API, eliminating the preview-only HTTP 500 while preserving local-development and production behavior.

## Local proof

- Strict full generation: passed all 2,427 expected routes in 58.00 seconds.
- Same-commit repeat: webpack reported `Skipping webpack build as no changes detected` and completed in 54.31 seconds.
- Two repeat outputs contained 7,611 files each and were byte-for-byte identical.
- The final lint-only configuration adjustment produced output identical to the deterministic baseline.
- Stable-path verification passed across three runs: a same-ref repeat was byte-identical, while changing only the deploy ref changed exactly `index.html` and `Artists--Bios.html` out of 7,611 files.
- The stable-path same-ref repeat completed in 47.72 seconds with webpack reuse.
- Lint error gate passed for all new JavaScript and deployment scripts.
- Current production comparison:
  - `/george_t_hetzel_artist.html`: HTTP 404.
  - `/george_t_hetzel_burnished_forest_stream.html`: HTTP 200.
  - Local generated artist route: biography plus both linked paintings present.
- Deploy Preview comparison:
  - `/george_t_hetzel_artist.html`: HTTP 200 with George T. Hetzel biography.
  - `/george_t_hetzel_burnished_forest_stream.html`: HTTP 200.
  - `/george_t_hetzel_for_later.html`: HTTP 200.
  - `/ipad/`: HTTP 200.

## Netlify behavior researched

- Build ignore commands use exit 0 to cancel and exit 1 to continue a build.
- `CACHED_COMMIT_REF` can equal `COMMIT_REF` when no prior cache is available, so the ignore script deliberately builds in that case.
- Local build plugins can be registered with `package = "./path"` and can run an `onSuccess` post-deploy verification.
- The post-deploy plugin reports a smoke failure with `failPlugin`; it does not roll back or alter production.
- Deploy Preview creation can additionally be suppressed with `[skip netlify]` or `[skip ci]` in the pull-request title when a preview is intentionally unnecessary.

Official references:

- https://docs.netlify.com/build/configure-builds/ignore-builds/
- https://docs.netlify.com/extend/develop-and-share/develop-build-plugins/
- https://docs.netlify.com/build/configure-builds/environment-variables/
- https://docs.netlify.com/build/caching/caching-overview/

## Historical preview proof status

1. Pull request 3813 and its public Deploy Preview were active during pre-merge verification.
2. The Netlify post-deploy plugin and a separate local verifier both pass all representative routes, V3 shared header/footer checks, the iPad route, George T. Hetzel routes, sitemap preservation, and production isolation.
3. A fresh desktop browser load of functional commit `de1b461a` produced no new console error. The previous background HTTP 500 was traced to preview analytics reaching the production NextLead API and is fixed by the canonical-host guard.
4. Documentation-only commit `aabcb6f9` was canceled by the ignore command in about 3.1 seconds, before generation or publication. Netlify records this expected cancellation with state `error` and the message `Canceled build due to no content change`.
5. Documentation-only commit `6500c122` was pushed while the pull-request title temporarily contained `[skip netlify]`. After more than 35 seconds, Netlify had created no deploy record and GitHub had received no Netlify status. The normal pull-request title was then restored.
6. The user later approved production rollout; see the 2026-07-16 rollout section below.

## Deploy Preview 3813 measurements

- First preview revision, before the stable route-state path: 267 seconds and 7,454 uploaded files. The post-deploy plugin correctly reported the four dead production sitemap entries.
- Second preview revision, with the narrowed sitemap verification but still before the stable path: 251 seconds and 4,909 uploaded files. Post-deploy plugin state: `success`.
- Stable-path transition revision: 254 seconds and 7,329 uploaded files. This one-time churn was expected because every route moved from a commit-specific state directory to `/_nuxt/static/cx-v1`.
- Minimal source-only proof revision: 251 seconds and exactly 2 uploaded files, `index.html` and `Artists--Bios.html`. The exact commit marker appeared on both pages and nowhere else.
- Analytics-guard functional revision: 258 seconds and 7,436 uploaded files. A shared client-bundle change necessarily changed route HTML and hashed assets, but all verification passed and the preview-only API error stopped recurring.

The two-file proof shows that upload churn is solved, but its 251-second duration also shows that upload was not the primary bottleneck. Full generation of 2,427 content routes, plus Netlify setup/plugin/function overhead, remains the dominant cost. Documentation-only build cancellation is therefore the high-value fast path.

## Final browser verification

- Desktop at 1280 x 900: no horizontal overflow, corrected 250 x 252 source logo, shared header and footer present, public Identity absent, and exact functional deploy ref present.
- Mobile at 390 x 844: no horizontal overflow, corrected source logo dimensions, shared header and footer present, navigation rendered, and public Identity absent.
- George T. Hetzel artist page: title and biography rendered, with links to both `george_t_hetzel_burnished_forest_stream.html` and `george_t_hetzel_for_later.html`.
- iPad index: HTTP 200 and 186 visible iPad painting links in the mobile browser pass.
- The Deploy Preview remains on verified functional commit `de1b461a`; later documentation-only commits intentionally did not publish a new preview.

## Efficiency result

```text
Change pushed
|
+-- Site-affecting file
|   `-- Full Nuxt generation + validation + deploy smoke (~251-267 seconds)
|
+-- Documentation only
|   `-- Ignore command cancels before generation (~3.1 seconds)
|
`-- Preview intentionally unnecessary
    `-- [skip netlify] in PR title creates no deploy attempt
```

The important distinction is that deterministic output and stable route-state paths make deploys auditable and reduce needless upload, but they cannot make Nuxt 2 avoid rendering 2,427 routes. The only measured way to remove that dominant cost is to avoid starting the build when the source change cannot affect the site. Site-affecting changes still receive the full safety checks.

## Legacy CMS and Publish Site compatibility audit

- The branch does not modify `static/admin/index.html`, `static/admin/config.yml`, `static/admin/bedford-publish-site.js`, `static/admin/bedford-s3-media-library.js`, `netlify/functions/publish-site.js`, or `netlify/functions/s3-upload.js`.
- The CMS still uses Git Gateway on `main` and adds `[skip netlify]` to ordinary create, update, delete, and media commits.
- The custom Publish Site Function still authenticates the Netlify Identity user and POSTs to the existing `BEDFORD_NETLIFY_BUILD_HOOK_URL`.
- A historical real CMS painting-save comparison was passed through `scripts/netlify-ignore-build.mjs`. The changed `cms/paintings/...json` file produced exit 1, meaning a build is required. The ignore rule skips only `migration/` notes and root AGENTS/README Markdown.
- The verified Deploy Preview serves `/admin/`, `/admin/config.yml`, and `/admin/bedford-publish-site.js` with HTTP 200. The admin page contains both the Netlify Identity widget and custom Publish Site script.
- The preview deploy includes the two Netlify Functions. An unauthenticated status request to `/.netlify/functions/publish-site` returned the expected HTTP 401 JSON response, proving routing and the authentication guard remain active.
- The post-deploy smoke plugin passed on the preview. On production it skips preview-versus-production comparisons but still validates the representative public routes, admin Identity marker, shared header/footer, deploy stamp, iPad section, and George T. Hetzel pages.
- An authenticated click was not performed because that would intentionally start a real production build. The unchanged UI/Function code, deployed Function guard, real CMS-change simulation, and successful full Deploy Preview together provide strong non-destructive compatibility evidence.

## Production rollout state - 2026-07-15

- Pull request 3813 remains open and unmerged at head `d10f3dd7`.
- GitHub `main` remains at `e248614d`, the approved V3 shared header/footer rollout.
- Netlify production deploy `6a56c57e015b7800080a3850` serves `e248614d`; it was published on 2026-07-14 and took 260 seconds.
- The production homepage does not contain the new `cx-deploy-ref` marker, and production still returns HTTP 404 for `/george_t_hetzel_artist.html`.
- Therefore the deterministic generation, cache preservation, documentation-only ignore rule, strict route validation, post-deploy smoke plugin, NextLead preview guard, and George T. route repair are Deploy Preview-only. The live CMS Publish Site button still invokes the pre-3813 production build setup.
- Merging PR 3813 into `main` and allowing its production build to pass is required before any CMS publish uses the new setup.

## Production rollout and publish-path proof - 2026-07-16

This section supersedes the pre-rollout state above.

1. The user explicitly approved the production rollout. Pull request 3813 was
   squash-merged into `main` as commit
   `6432c45116d4a021308fe83152f505603c341274`.
2. Netlify production deploy `6a5873e1278c970008c8b589` completed successfully:
   - state: `ready`
   - plugin state: `success`
   - deploy time: 243 seconds
   - published: `2026-07-16T06:06:13.749Z`
   - 4,876 files uploaded during the one-time production transition
   - 393 redirect rules and two header rules processed
   - `publish-site` and `s3-upload` Functions deployed
   - no secret-scan matches
3. The independent deploy verifier passed against both the canonical Bedford
   domain and the Netlify production alias. It checked 15 representative routes,
   including the homepage, shared header/footer pages, `/ipad/`, `/admin/`, the
   restored George T. Hetzel artist route, and both linked George T. paintings.
4. The live homepage and Artists/Bios page contained the exact invisible deploy
   marker for `6432c451`. Public pages contained no Netlify Identity widget,
   while `/admin/` contained it. All four admin assets returned HTTP 200. The
   unauthenticated Publish Site status endpoint returned the expected HTTP 401
   JSON response.
5. A controlled CMS-publish-path proof then used an empty, non-visible commit
   `1c17e89d401c5a33badf585c8825deb5a23cf159` with `[skip netlify]` in its commit
   message. After 40 seconds, Netlify had created zero automatic deploys for the
   commit.
6. The exact `BEDFORD_NETLIFY_BUILD_HOOK_URL` stored in Netlify and used by the
   custom Publish Site Function was then invoked directly. It returned HTTP 200
   and created production deploy `6a58773756c5fa000820500f`, titled
   `Deploy triggered by hook: CMS Publish Site`.
7. The hook-triggered production deploy completed successfully:
   - state: `ready`
   - plugin state: `success`
   - deploy time: 181 seconds
   - published: `2026-07-16T06:19:26.104Z`
   - exactly two files uploaded: `index.html` and `artists--bios.html`
   - both Functions deployed
   - no secret-scan matches
8. The independent 15-route production verifier passed again after the hook
   deployment. GitHub `main` and the latest ready production deploy both point
   to `1c17e89d`, so the custom publish status comparison is clean and current.
9. The proof did not impersonate a CMS editor or click the authenticated button
   in a browser. It exercised the same saved-commit suppression and exact
   server-side build-hook endpoint used by that button, while the unchanged
   admin UI, deployed Function, Identity boundary, and authorization guard were
   verified separately.

Measured production behavior is now:

```text
CMS Save commit containing [skip netlify]
`-- No automatic Netlify deploy

Publish Site build hook
`-- Full validated production deploy
    |-- Warm-cache run: 181 seconds
    `-- Same-source output: two stamped HTML files uploaded
```

## Real-editor confirmation request - 2026-07-16

- The user does not have a Netlify CMS login and no additional Identity user
  slot is available without a plan change.
- An unsent Gmail draft was created from the connected support mailbox to
  `support@nittanyweb.com`, addressed to Shawn.
- The draft asks Shawn to make one small legitimate CMS edit, confirm Save does
  not start a build, click the separate Publish Site button, verify the change
  on the live page, and report the page, edit, publish timing, and any errors.
- This final real-editor confirmation remains pending until the user reviews and
  manually sends the draft and Shawn completes the test.
- Follow-up: the user rewrote the message and scheduled it to send at 6:00 AM.
  The next pending event is Shawn's CMS Save and Publish Site test and report.
