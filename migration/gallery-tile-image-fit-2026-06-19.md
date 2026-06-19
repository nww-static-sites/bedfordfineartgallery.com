# Gallery tile image fit fix - 2026-06-19

## Report

Some images on `https://www.bedfordfineartgallery.com/Artists--Bios.html` were
displaying distorted because their source dimensions did not match the fixed
gallery tile ratio.

The proposed fix was to change the gallery tile image from
`object-fit: fill` to `object-fit: contain`.

## Change

Updated `components/GalleryTile.vue`:

- changed `.artist_gallery_image` from `object-fit: fill` to
  `object-fit: contain`
- added `object-position: center`
- added `background-color: #000000`

This preserves the fixed gallery tile shape while preventing non-matching image
ratios from being stretched. When an image is not exactly `392 x 261`, it is now
centered with black letterboxing instead of distortion.

## Verification

- `yarn validate:cms` passed.
- `yarn generate` passed.
- Local generated page check at `/Artists--Bios.html` confirmed the gallery tile
  image computed style:
  - `object-fit: contain`
  - `object-position: 50% 50%`
  - `background-color: rgb(0, 0, 0)`
  - tile ratio remained about `1.50`, matching `392 / 261`.
