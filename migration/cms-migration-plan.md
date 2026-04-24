# CMS migration plan

## Desired end state

New CMS-created image references should point to `https://img.bedfordfineartgallery.com/...` and should not use Cloudinary or commit large image binaries into the Git repo.

## Recommended path

1. Keep `/admin/` frozen through the public image migration and verification.
2. Migrate existing Cloudinary assets to S3 and rewrite existing content using `migration/cloudinary-to-s3-map.csv`.
3. Replace `media_library: cloudinary` before unfreezing the CMS.
4. Prefer a small controlled upload workflow for Joan: upload image files to S3 using an authenticated server-side endpoint or operator-assisted script, then store the final `img.bedfordfineartgallery.com` URL in the CMS field.
5. If Netlify CMS must remain the editor, add a custom image widget/media-library integration that uploads to a server-side endpoint. The browser must not receive AWS write credentials.
6. Document exact image prep requirements from the current hints: gallery crop 392x261, grid 392x261, medium around 1200px, high-res around 2800px, art-on-wall around 1200px. These are separate prepared assets, not something the current frontend reliably generates at runtime.

## Paths not recommended without explicit approval

- Do not switch `media_folder`/`public_folder` to commit uploaded images into this Git repo unless explicitly approved.
- Do not leave `media_library: cloudinary` active after cutover.
- Do not put AWS secret keys in `static/admin/config.yml` or any browser-delivered JavaScript.

## Open decision

Choose the future upload mechanism before unfreezing `/admin/`: custom S3 uploader endpoint, operator-assisted upload script plus CMS URL paste, or replacement CMS/media service that can write to the existing S3-backed image host.
