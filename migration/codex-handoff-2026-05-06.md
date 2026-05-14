# Codex handoff - 2026-05-06

## Purpose

This note captures the Bedford Fine Art Gallery migration and CMS workflow work
completed across the Cloudinary-to-S3 migration, CMS upload repair, and Netlify
publish workflow changes.

Loaded context for this note:

- `CODEX_MIGRATION_INSTRUCTIONS.md`
- `migration/cms-migration-plan.md`
- `migration/cms-upload-path-report.md`
- `migration/cms-publish-workflow.md`
- `migration/test-results.md`

## Current production state

- Public image host is `https://img.bedfordfineartgallery.com`.
- Existing Cloudinary rollback host `images.bedfordfineartgallery.com` was not
  repointed or deleted.
- Netlify site ID is `50e4dd76-2749-40f0-bad3-310eb125bb8a`.
- Netlify project name is `stupefied-ramanujan-ca1b24`.
- GitHub repo is `nww-static-sites/bedfordfineartgallery.com`.
- Production branch is `main`.
- Netlify build command is `yarn run generate`; publish directory is `dist`.

Latest deploy status checked on 2026-05-06:

- `bae3af1e` - `Deploy triggered by hook: CMS Publish Site` - ready
- `888d7241` - `Relabel CMS entry publish as save` - ready
- `96bd5151` - `Show shared CMS publish status` - ready
- `3162fc78` - `Prevent duplicate CMS publish clicks` - ready

One duplicate manual hook deploy from testing was cancelled:

- `183405fd` - `Deploy triggered by hook: CMS Publish Site` - error/cancelled

## Image migration summary

- Cloudinary export completed with `5,237` assets and `0` failures.
- Downloaded Cloudinary bytes verified locally: `4,144,686,068`.
- S3 upload verification found all `5,237` migrated objects.
- Public S3 sample checks passed for root assets, `cms-uploads`, `mailers/img`,
  `gallery-sliding-images`, and `customer-images`.
- Public code/content scan passed for Cloudinary references outside migration
  documentation/artifacts.
- S3 URL coverage check passed for `4,217` unique `img.bedfordfineartgallery.com`
  URLs with `0` missing S3 keys.

See also:

- `migration/test-results.md`
- `migration/rewrite-report.md`
- `migration/upload-verification.md`
- `migration/rollback-plan.md`

## CMS upload workflow

The CMS no longer uses the old Cloudinary media library.

Current CMS media behavior:

- `static/admin/config.yml` configures `media_library: name: bedford_s3`.
- `static/admin/bedford-s3-media-library.js` registers the custom media library.
- `netlify/functions/s3-upload.js` receives CMS uploads server-side and writes to
  the S3-backed image bucket.
- Browser JavaScript does not receive AWS write credentials.
- The CMS stores public `https://img.bedfordfineartgallery.com/...` URLs in Git.
- Uploaded image files are not committed to Git and are not stored in Netlify.

Large upload behavior:

- Current upload max is `25 MB`.
- Large files are chunked through Netlify Blobs before being assembled and sent to
  S3.
- Temporary chunks are deleted after success where possible.
- Stale chunk cleanup is attempted opportunistically.

Relevant Netlify environment variable names:

- `BEDFORD_AWS_ACCESS_KEY_ID`
- `BEDFORD_AWS_SECRET_ACCESS_KEY`
- `BEDFORD_S3_BUCKET`
- `BEDFORD_S3_REGION`
- `BEDFORD_IMAGE_HOST`
- `BEDFORD_UPLOAD_PREFIX`
- `BEDFORD_UPLOAD_MAX_BYTES`
- `BEDFORD_NETLIFY_BLOBS_SITE_ID`
- `BEDFORD_NETLIFY_BLOBS_TOKEN`

Do not commit secret values.

## CMS publish workflow

The old problem was that every CMS save committed to `main` and triggered a full
Netlify production deploy.

Current behavior:

- CMS saves still commit JSON content to GitHub `main`.
- CMS commit messages include `[skip netlify]`.
- Ordinary CMS saves should not auto-trigger Netlify deploys.
- Editors batch changes and then use the custom bottom-right CMS panel.
- The custom panel shows shared Git/Netlify state:
  - `Nothing to Publish`
  - `Publish Site`
  - `Publishing...`
  - `Status Error`
- The panel polls `GET /.netlify/functions/publish-site` every 30 seconds.
- The status function compares GitHub `main` to the latest successful Netlify
  production deploy.
- `POST /.netlify/functions/publish-site` triggers a deploy through a dedicated
  Netlify build hook only when there are unpublished commits.
- The function blocks duplicate publishes while Netlify is building or shortly
  after a publish starts.
- The function blocks no-op publishes when live already matches GitHub.

Relevant files:

- `static/admin/config.yml`
- `static/admin/bedford-publish-site.js`
- `netlify/functions/publish-site.js`
- `migration/cms-publish-workflow.md`

Relevant Netlify environment variable names:

- `BEDFORD_NETLIFY_BUILD_HOOK_URL`
- `BEDFORD_NETLIFY_SITE_ID`
- `BEDFORD_NETLIFY_STATUS_TOKEN` (optional; current code falls back to Blobs token)
- `BEDFORD_CMS_PUBLISH_EMAILS`
- `BEDFORD_CMS_PUBLISH_STORE`
- `BEDFORD_CMS_PUBLISH_COOLDOWN_MS`

Allowed publisher emails currently expected:

- `andrew.sabourin@seoexperts.com`
- `joanhawk@comcast.net`
- `shawns@webretailgroup.com`
- `support@nittanyweb.com`
- `tech@webretailgroup.com`

## CMS wording change

Because the CMS built-in `Publish` button now means "save this entry to Git" and
the custom `Publish Site` button means "deploy the public site", the admin script
adds a wording layer for entry-level CMS controls.

Rendered Netlify CMS labels are changed from:

- `Publish` -> `Save`
- `Publishing...` -> `Saving...`
- `Publish and create new` -> `Save and create new`
- `Publish and duplicate` -> `Save and duplicate`
- `Publish now` -> `Save now`

The custom site-level button remains `Publish Site`.

Implementation note: this is a DOM label layer in
`static/admin/bedford-publish-site.js`, not a fork of Netlify CMS. It watches CMS
render changes and replaces exact labels. It intentionally skips the custom
publish panel.

## Live CMS tests observed

Shawn tested CMS saves on 2026-05-05:

- `33d2813e` - painting update - included `[skip netlify]` - did not auto-deploy.
- `183405fd` - testimonial update - included `[skip netlify]` - did not auto-deploy.
- Clicking `Publish Site` triggered one hook deploy for `183405fd`; it finished
  ready.
- A second click during testing eventually queued a duplicate hook deploy; it was
  cancelled. Follow-up code added browser and server guards against repeats.

Further production evidence on 2026-05-06:

- `bae3af1e` - article update - included `[skip netlify]`.
- A later hook deploy published `bae3af1e` successfully.

## Important caveats

- Exact logged-in CMS editor UI should still be visually checked with Shawn or
  Joan after each admin script change.
- The Save/Publish wording layer depends on exact rendered labels from the older
  Netlify CMS bundle. If the CMS bundle changes its wording or markup, the labels
  may need another small adjustment.
- `GET /.netlify/functions/publish-site` and `POST /.netlify/functions/publish-site`
  require Netlify Identity context; unauthenticated requests correctly return
  `401`.
- Shawn's old SSH view on `beta.ecommerceplatform.com` is not the source of truth
  for this workflow. Production deploys come from GitHub to Netlify.

## Suggested future checks

1. Log into `/admin/` as Shawn or Joan.
2. Open an existing painting and confirm the built-in entry button says `Save`.
3. Confirm the bottom-right site panel says `Nothing to Publish` when live is
   current.
4. Make a tiny CMS edit and save it.
5. Confirm GitHub receives a `[skip netlify]` commit.
6. Confirm Netlify does not auto-deploy.
7. Confirm both Shawn and Joan sessions show `Publish Site` within 30 seconds.
8. Click `Publish Site` once.
9. Confirm Netlify starts one hook deploy and the panel shows `Publishing...`.
10. Confirm the panel returns to `Nothing to Publish` after the deploy is ready.

## Local notes

- Local repo path: `/Users/x/Documents/Codex Projects/Cloudinary/bedfordfineartgallery.com`
- Netlify token file used by Codex: `~/.config/codex-secrets/netlify-bedford-token`
- Do not print or commit token values.
- Keep unrelated CMS content commits made by editors; do not revert them.
