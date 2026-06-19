# YouTube URL Normalization - 2026-06-19

## Issue

The Eugenia Shankland painting page stored this CMS value:

`https://youtu.be/FBidmy659d0?si=BA0PS0ehD9zxGKfU`

The public page used `vue-lazy-youtube-video`, which expects iframe-safe embed
URLs in this form:

`https://www.youtube.com/embed/FBidmy659d0?rel=0`

When the page passed the `youtu.be` share URL through unchanged, the browser
resolved the clicked iframe to a normal YouTube watch URL. YouTube returns
`X-Frame-Options: SAMEORIGIN` for watch URLs, so the browser refused to display
it in an iframe.

## Fix

- Added `libs/youtube.js` with a normalizer that converts supported YouTube
  share/watch/Shorts/embed URLs to `https://www.youtube.com/embed/<id>?rel=0`.
- Updated `components/YouTubeVideo.vue` so every use of the shared video wrapper
  passes a normalized embed URL to `vue-lazy-youtube-video`.
- Updated CMS hints and validation patterns in `static/admin/config.yml` for
  paintings and highlights to say that share, watch, Shorts, or embed URLs are
  acceptable.

This is intentionally a wrapper-level fix rather than a one-record content-only
fix, because the CMS already had many non-`www.youtube.com/embed/...` records:
one `youtu.be` value, 35 Shorts URLs, and several `youtube.com/embed/...` values
without `www`.

## Validation

- `git diff --check`: passed.
- `node validate-cms-relations.mjs`: passed.
- URL helper checks passed for:
  - `youtu.be/<id>?si=...`
  - `youtube.com/watch?si=...&v=<id>`
  - `youtube.com/shorts/<id>`
  - `youtube.com/embed/<id>`
  - `youtube.com/embed/<id>?start=12&rel=0`
- CMS regex checks passed for share, watch, Shorts, embed, and
  youtube-nocookie embed URLs.
- `yarn run generate`: passed.
- Generated Shankland page contains:
  - `https://i.ytimg.com/vi_webp/FBidmy659d0/hqdefault.webp`
  - `https://i.ytimg.com/vi/FBidmy659d0/hqdefault.jpg`
- Generated Shankland page no longer contains the empty thumbnail path
  `https://i.ytimg.com/vi_webp//hqdefault.webp`.
- Direct HTTP checks confirmed YouTube allows the embed URL in an iframe and
  blocks the watch URL with `X-Frame-Options: SAMEORIGIN`.

## Caveat

Playwright is not installed in this repo, so click-level verification was done
by generated markup, compiled bundle, and YouTube header checks rather than a
browser automation trace.
