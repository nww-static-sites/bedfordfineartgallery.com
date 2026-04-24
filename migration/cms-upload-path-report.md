# CMS upload path report

## Current behavior

- `/admin/` is served by `static/admin/index.html`; it is currently frozen and does not load Netlify CMS.
- The normal editor page loads Netlify Identity and Netlify CMS from external scripts.
- `static/admin/config.yml` uses `backend: name: git-gateway` on branch `main`, so CMS saves commit directly to GitHub through Netlify Identity/Git Gateway.
- `static/admin/config.yml` configures `media_library: name: cloudinary` with cloud `dg6smdedp` and a public API key.
- There are no `media_folder` or `public_folder` settings, so uploads are not configured to land in the Git repo.
- The painting collection has image widgets for `galleryCropImage`, `gridImage`, `mediumResImage`, `highResImage`, and `artOnWallImage`.
- The articles collection has image widgets for `gridImage` and `image`.
- The Art Lovers Niche collection uses a text `body` field; its HTML bodies contain hardcoded Cloudinary image URLs.

## What gets stored

- Painting image widgets currently store full `https://res.cloudinary.com/dg6smdedp/image/upload/...` URLs.
- Article image widgets currently store full `https://res.cloudinary.com/dg6smdedp/image/upload/...` URLs.
- `output_filename_only: true` is present in the Cloudinary media library config, but the committed content shows full URLs. For cutover planning, assume full URL storage.
- No inspected CMS image values are stored as S3 URLs yet.

## Answers to required questions

1. Joan uploads painting images through Netlify CMS image widgets backed by Cloudinary Media Library.
2. Joan uploads article/blog images through Netlify CMS image widgets backed by Cloudinary Media Library. Art Lovers Niche bodies can also embed Cloudinary URLs directly in HTML.
3. Cloudinary is configured directly in `static/admin/config.yml`; I found no custom uploader plugin or `window.CMS` customization.
4. Existing uploads store full Cloudinary URLs in content.
5. Future uploads require replacing the Cloudinary media library with an S3-backed workflow or a custom CMS uploader before `/admin/` is unfrozen.

## Risk notes

- Re-enabling the current CMS config after the public rewrite would allow new Cloudinary URLs to enter content again.
- Switching Netlify CMS to repository media uploads would put large image files into Git, which the migration brief explicitly says not to do without approval.
- Netlify CMS does not natively know how to upload to this existing S3 website bucket from the current config; a custom uploader, external upload step, or different CMS/media workflow is needed.
