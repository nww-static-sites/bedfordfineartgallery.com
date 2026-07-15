# Netlify build efficiency and route reliability - 2026-07-14

## Status

- Work is isolated on `cx/netlify-efficiency-and-route-fixes-2026-07-14`.
- Pull request: https://github.com/nww-static-sites/bedfordfineartgallery.com/pull/3813
- Deploy Preview: https://deploy-preview-3813--stupefied-ramanujan-ca1b24.netlify.app/
- Latest verified functional commit: `de1b461a`.
- Production has not been changed by this work.
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

## Preview proof status

1. Pull request 3813 and its public Deploy Preview are active.
2. The Netlify post-deploy plugin and a separate local verifier both pass all representative routes, V3 shared header/footer checks, the iPad route, George T. Hetzel routes, sitemap preservation, and production isolation.
3. A fresh desktop browser load of functional commit `de1b461a` produced no new console error. The previous background HTTP 500 was traced to preview analytics reaching the production NextLead API and is fixed by the canonical-host guard.
4. Documentation-only commit `aabcb6f9` was canceled by the ignore command in about 3.1 seconds, before generation or publication. Netlify records this expected cancellation with state `error` and the message `Canceled build due to no content change`.
5. The pull-request title now temporarily contains `[skip netlify]` for a separate live test. The normal title must be restored immediately after the result is recorded.
6. Do not merge or deploy to production without explicit user approval.

## Deploy Preview 3813 measurements

- First preview revision, before the stable route-state path: 267 seconds and 7,454 uploaded files. The post-deploy plugin correctly reported the four dead production sitemap entries.
- Second preview revision, with the narrowed sitemap verification but still before the stable path: 251 seconds and 4,909 uploaded files. Post-deploy plugin state: `success`.
- Stable-path transition revision: 254 seconds and 7,329 uploaded files. This one-time churn was expected because every route moved from a commit-specific state directory to `/_nuxt/static/cx-v1`.
- Minimal source-only proof revision: 251 seconds and exactly 2 uploaded files, `index.html` and `Artists--Bios.html`. The exact commit marker appeared on both pages and nowhere else.
- Analytics-guard functional revision: 258 seconds and 7,436 uploaded files. A shared client-bundle change necessarily changed route HTML and hashed assets, but all verification passed and the preview-only API error stopped recurring.

The two-file proof shows that upload churn is solved, but its 251-second duration also shows that upload was not the primary bottleneck. Full generation of 2,427 content routes, plus Netlify setup/plugin/function overhead, remains the dominant cost. Documentation-only build cancellation is therefore the high-value fast path.
