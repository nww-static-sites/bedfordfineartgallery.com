# S3 upload verification

## Summary

The Cloudinary export was uploaded to the existing S3 bucket behind `img.bedfordfineartgallery.com`.

- Expected migrated objects: `5,237`.
- Bucket migrated objects found: `5,237`.
- Expected migrated bytes: `4,144,686,068`.
- Bucket migrated bytes found: `4,144,686,068`.
- Missing migrated objects: `0`.
- Size mismatches: `0`.
- Total bucket objects after upload: `5,239`.

The two extra bucket objects are the pre-existing objects:

- `.probe`
- `schryer_home_full_crop.jpg`

## Verification commands

Local download verification:

```bash
find migration/cloudinary-downloads -type f | wc -l
find migration/cloudinary-downloads -type f -exec stat -f %z {} + | awk '{sum += $1} END {printf "%.0f\n", sum}'
```

Bucket snapshot command:

```bash
AWS_PROFILE=bedford-img aws s3api list-objects-v2 --bucket img.bedfordfineartgallery.com --output json --query 'Contents[].{Key:Key,Size:Size,LastModified:LastModified}'
```

The bucket snapshot was compared against `migration/cloudinary-assets.json` by exact `target_s3_key` and byte size.

## Public URL samples

The following public URLs were checked through `https://img.bedfordfineartgallery.com`:

| Area | URL | Status | Content length |
| --- | --- | --- | --- |
| Root asset | `https://img.bedfordfineartgallery.com/19-century-artists-vs-contemporary-artists_uct4j2.png` | `200` | `1,170,951` |
| CMS uploads | `https://img.bedfordfineartgallery.com/cms-uploads/0263_grid.jpg` | `200` | `47,144` |
| Mailers | `https://img.bedfordfineartgallery.com/mailers/img/4_grid.jpg` | `200` | `23,953` |
| Gallery sliding images | `https://img.bedfordfineartgallery.com/gallery-sliding-images/gallery_exterior_homepage.jpg` | `200` | `1,261,570` |
| Customer images | `https://img.bedfordfineartgallery.com/customer-images/1.jpg` | `200` | `47,036` |

Each sampled object returned the expected `Content-Length` and `Cache-Control: public, max-age=31536000, immutable`.

## Result

Phase 4 upload verification passed. The next migration step is to rewrite site code and content to reference `img.bedfordfineartgallery.com` using `migration/cloudinary-to-s3-map.csv`.
