# Migration test results

## Completed

- `/admin/` live freeze check passed after the Netlify deploy of the freeze commit.
- Cloudinary export completed with `5,237` assets and `0` failures.
- Local download verification passed:
  - files: `5,237`
  - bytes: `4,144,686,068`
- S3 upload verification passed:
  - migrated objects expected: `5,237`
  - migrated objects found: `5,237`
  - missing objects: `0`
  - size mismatches: `0`
- Public S3 sample checks passed for:
  - root assets
  - `cms-uploads`
  - `mailers/img`
  - `gallery-sliding-images`
  - `customer-images`
- CMS JSON parse check passed for all `cms/**/*.json`.
- Public code/content Cloudinary scan passed:
  - no `cloudinary`
  - no `res.cloudinary.com`
  - no `images.bedfordfineartgallery.com`
  - no `media_library`
  outside migration documentation/artifacts.
- S3 URL coverage check passed:
  - unique `img.bedfordfineartgallery.com` URLs checked: `4,217`
  - missing uploaded S3 keys: `0`
- JavaScript syntax checks passed for:
  - `nuxt.config.js`
  - `providers/bedford-img.js`
  - `migration/scripts/download-cloudinary-assets.mjs`
  - `migration/scripts/rewrite-cloudinary-urls.mjs`

## Not Run Locally

- Nuxt build/generate was not run locally because this machine currently has Node but no `npm`, `yarn`, `pnpm`, `bun`, existing `node_modules`, or Corepack.
- Browser visual QA was not run because the Nuxt app could not be started locally without dependencies.

## Required Before Production Cutover

- Install project dependencies in a suitable environment or let Netlify build a branch deploy.
- Run the static generation build.
- Inspect representative pages from the checklist in `migration/test-checklist.md`.
- Confirm production or branch deploy network requests use `img.bedfordfineartgallery.com` and not Cloudinary.
