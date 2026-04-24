# Cloudinary rewrite report

## Summary

Site code and content were rewritten to use:

- `https://img.bedfordfineartgallery.com`

The rewrite used `migration/cloudinary-assets.json` and `migration/cloudinary-to-s3-map.csv`, not a blind host-only replacement.

## What Changed

- Rewrote direct Cloudinary delivery URLs in CMS JSON, Vue files, Nuxt config, and static mailer HTML.
- Rewrote old `images.bedfordfineartgallery.com/dg6smdedp/image/upload/...` references to the new `img` host.
- Replaced `provider="cloudinary"` with `provider="bedford"` in Nuxt image components.
- Added a local Nuxt Image provider at `providers/bedford-img.js`.
- Updated `nuxt.config.js` to use the local `bedford` provider.
- Removed the Cloudinary media library block from `static/admin/config.yml`.
- Removed the old painting-page runtime domain shim.

## Counts

- Files changed by the rewrite: `1,262`.
- Direct image URL replacements: `6,844`.
- Nuxt image provider replacements: `143`.
- Legacy helper cleanups: `10`.
- Unresolved Cloudinary URLs after alias handling: `0`.

Two historical references did not have exact Cloudinary public-ID matches in the exported inventory and were handled with explicit aliases:

- `customer-images/99.jpg` -> `customer-images/99_zwy5rn.jpg`
- `mailers/img/boskerck_mailer.jpg` -> `images/boskerck_mailer2_hqwtgt.jpg`

## Validation

The following checks passed:

- CMS JSON parse check: all `cms/**/*.json` files parse successfully.
- Public Cloudinary scan: no remaining `cloudinary`, `res.cloudinary.com`, `images.bedfordfineartgallery.com`, or `media_library` references outside migration documentation/artifacts.
- S3 key coverage: `4,217` unique `https://img.bedfordfineartgallery.com/...` URLs in site code/content matched known uploaded S3 objects.
- Missing S3-backed image URLs: `0`.

## Remaining Risk

The public site no longer references Cloudinary, but the CMS must remain frozen until a new upload workflow is implemented. Removing the Cloudinary media library prevents accidental future Cloudinary uploads, but it does not by itself provide Joan a replacement image upload path.

Recommended CMS path remains:

- keep `/admin/` frozen
- implement an S3-backed upload workflow or approved manual upload process
- test uploads into `img.bedfordfineartgallery.com`
- only then unfreeze `/admin/`
