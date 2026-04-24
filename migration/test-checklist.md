# Migration test checklist

## Pre-deploy Checks

- Confirm `/admin/` is still frozen.
- Confirm S3 upload verification passed.
- Confirm no public code/content references remain for Cloudinary hosts.
- Confirm CMS JSON parses after rewrite.
- Confirm all rewritten `img.bedfordfineartgallery.com` URLs map to uploaded S3 keys.

## Page Checks

- Homepage:
  - hero/logo imagery
  - homepage scrolling artwork carousel
  - gallery exterior/sliding images
  - customer/testimonial imagery

- Gallery/listing pages:
  - main gallery thumbnails
  - artist listing thumbnails
  - sold/notable sales sliders
  - Victorian art page static images

- Painting detail pages:
  - sold painting image
  - available painting zoom desktop
  - available painting zoom mobile
  - high-res zoom image
  - art-on-wall image when present
  - shipping options image
  - ArtPlacer image URL

- Article/blog pages:
  - highlights index thumbnails
  - article detail image
  - markdown/body embedded images
  - Art Lovers Niche embedded mailer images

- Static mailers:
  - header/nav images
  - product grid images
  - footer/social images

## CMS Checks Before Unfreeze

- Confirm `static/admin/index.html` still serves the freeze page.
- Confirm `static/admin/config.yml` does not point to Cloudinary.
- Do not unfreeze until an S3 upload workflow exists.
- Test the selected future upload workflow against `img.bedfordfineartgallery.com`.

## Production Smoke Checks After Deploy

- Load representative pages and inspect the browser network panel for image hosts.
- Verify image requests use `img.bedfordfineartgallery.com`.
- Verify no requests go to `res.cloudinary.com`.
- Verify no requests go to `images.bedfordfineartgallery.com`.
- Verify no obvious broken images or layout collapses.
- Keep `images.bedfordfineartgallery.com` unchanged for rollback.
