# Cutover runbook

## Preconditions

- `/admin/` is frozen.
- Cloudinary assets remain untouched.
- `images.bedfordfineartgallery.com` remains untouched.
- S3 upload verification has passed.
- Rewrite verification has passed.
- A branch build or equivalent Nuxt generate test has passed.

## Cutover Steps

1. Confirm `/admin/` still serves the freeze page.
2. Confirm `migration/upload-verification.md` still matches the S3 bucket state.
3. Confirm there are no public Cloudinary references outside migration documentation:

```bash
rg -n "cloudinary|res\\.cloudinary\\.com|images\\.bedfordfineartgallery\\.com|media_library" --glob '!node_modules/**' --glob '!dist/**' --glob '!.nuxt/**' --glob '!migration/**' --glob '!yarn.lock'
```

4. Deploy the migration branch after build/test approval.
5. Wait for Netlify deployment to complete.
6. Smoke test production pages:
   - homepage
   - main gallery
   - one artist page
   - one available painting detail page
   - one sold painting detail page
   - highlights index
   - one article detail page
   - one Art Lovers Niche article
7. In browser/network checks, confirm images load from `img.bedfordfineartgallery.com`.
8. Confirm no obvious broken images, missing thumbnails, or zoom failures.
9. Keep `/admin/` frozen after public cutover until the future upload workflow is implemented and tested.

## Do Not Do During First Cutover

- Do not delete Cloudinary assets.
- Do not modify Cloudflare.
- Do not repoint or remove `images.bedfordfineartgallery.com`.
- Do not unfreeze `/admin/`.
