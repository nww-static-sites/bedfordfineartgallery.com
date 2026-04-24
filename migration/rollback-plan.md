# Rollback plan

## Rollback Path

The rollback path is the existing Cloudinary-backed hostname:

- `images.bedfordfineartgallery.com`

It has not been modified by this migration.

## If Deployment Fails Before Going Live

1. Do not merge/deploy the migration branch.
2. Keep `/admin/` frozen if migration work is still in progress.
3. Investigate build errors or broken pages on the branch deploy.

## If Production Cutover Breaks Images

1. Revert the migration rewrite commit from `main`.
2. Redeploy the previous working site version.
3. Confirm production image requests again use the pre-migration image path.
4. Leave S3 uploaded objects in place; they are harmless and useful for retry.
5. Keep Cloudinary assets untouched.

## If CMS Editing Is Needed Before Upload Workflow Exists

1. Do not restore the old Cloudinary media library without an explicit decision.
2. Prefer a temporary operator-assisted edit where image URLs are uploaded to S3 and pasted as final `img.bedfordfineartgallery.com` URLs.
3. If Cloudinary must be restored temporarily, document the exact window and plan another content sync afterward.

## Reversibility Notes

- `/admin/` freeze is documented in `migration/admin-freeze.md`.
- S3 upload did not overwrite unrelated bucket objects.
- Cloudinary assets were not deleted.
- `images.bedfordfineartgallery.com` remains available as the first-pass rollback path.
