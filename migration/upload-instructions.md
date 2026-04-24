# Cloudinary-to-S3 upload instructions

## Upload target

- Bucket: `s3://img.bedfordfineartgallery.com`
- Public host: `https://img.bedfordfineartgallery.com`
- AWS profile: `bedford-img`
- Local source directory: `migration/cloudinary-downloads/`

The local source directory is intentionally ignored by Git because it contains the downloaded image binaries.

## Object-key strategy

The migration preserves the Cloudinary public ID path and appends the asset format as the file extension.

Examples:

- `example_public_id` with format `jpg` -> `example_public_id.jpg`
- `cms-uploads/example` with format `jpg` -> `cms-uploads/example.jpg`
- `mailers/img/example` with format `png` -> `mailers/img/example.png`

This keeps existing Cloudinary folder intent where it exists and avoids writing assets into Netlify or the Git repo.

## Pre-upload checks

Before upload, the following checks were performed:

- Cloudinary inventory: `5,237` image assets.
- Local downloaded files: `5,237`.
- Local downloaded bytes: `4,144,686,068`.
- Target S3 keys: `5,237` unique keys.
- Target-key collisions: `0`.
- Existing bucket objects before upload:
  - `.probe`
  - `schryer_home_full_crop.jpg`

Neither existing bucket object collided with a migration target key.

## Dry run

Dry run command:

```bash
AWS_PROFILE=bedford-img aws s3 sync migration/cloudinary-downloads/ s3://img.bedfordfineartgallery.com/ --dryrun --exclude '.DS_Store'
```

Dry run result:

- Planned uploads: `5,237`.
- Planned deletes: `0`.
- Planned copies: `0`.

## Actual upload

Actual upload command:

```bash
AWS_PROFILE=bedford-img aws s3 sync migration/cloudinary-downloads/ s3://img.bedfordfineartgallery.com/ --exclude '.DS_Store' --cache-control 'public, max-age=31536000, immutable' --no-progress --only-show-errors
```

Notes:

- No Cloudinary assets were modified or deleted.
- `images.bedfordfineartgallery.com` was not modified.
- The existing two bucket objects were left untouched.
- Uploaded objects were given long-lived immutable cache headers for Cloudflare/browser caching.
