# Netlify CMS retirement — 2026-08-22

## Purpose

The Bedford Fine Art Gallery Netlify CMS is permanently retired before the new
Extranet editor is allowed to write. This enforces a single-writer cutover and
prevents Shawn, Joan, Jerry, or a cached browser session from changing content
through the former CMS.

## Pre-retirement production evidence

- GitHub `main`: `aaff504ff24f70e4713bf7c3f3e32914ae2823f1`
- `/admin/`: HTTP 200; SHA-256
  `e54eaa1ceff886b5ad229da0289e11d3a4ae4d67f8f839504f7b9fd22694916f`
- `/admin/config.yml`: HTTP 200; SHA-256
  `917550eced951cad70fcf2ef3f7beb282a7ca70101f58f44aa354bf5108041aa`
- unauthenticated `POST /.netlify/functions/s3-upload`: HTTP 400; SHA-256
  `98da274bbd090adc541bef881707bf94f2c65bc022f10c3cdb4c0bdc6dc23474`
- unauthenticated `GET /.netlify/functions/publish-site`: HTTP 401; SHA-256
  `939d8047807cbb5200d32fc419e43117a13501e56ca966b79e913a8aef3c7e13`

The pre-retirement files remain recoverable from Git commit `aaff504f`. They
must not be restored to production as an emergency editor. Any emergency
content change after retirement must use a controlled administrator Git edit.

## Retirement controls

1. Disable Netlify Git Gateway in the site control plane. This is the primary
   kill switch for cached CMS tabs and previously authenticated Identity users.
2. Replace `/admin/` with a no-cache retirement notice that loads neither
   Netlify Identity nor Netlify CMS.
3. Remove the public CMS configuration and both custom browser scripts.
4. Make the former upload and publish Functions return HTTP 410 for every
   request without reading credentials or calling providers.
5. Verify representative public pages and images remain healthy.

## Required post-deploy proof

- `/admin/` is HTTP 200 and contains the retirement notice.
- `/admin/` contains no Identity, Netlify CMS, upload, or publish scripts.
- `/admin/config.yml` and both former admin scripts are HTTP 404.
- both former Netlify Functions return HTTP 410 with `retired: true`.
- Git Gateway is disabled in Netlify and a cached/old CMS client cannot write.
- the public home page, representative collection pages, and S3 image host
  continue to return HTTP 200.

## Rollback

The safe rollback is to restore public-site serving while keeping all old CMS
write paths disabled. Do not re-enable Git Gateway, the old CMS, or the legacy
Functions. If the retirement deploy damages a public page, deploy the previous
site output or revert only the unrelated public-site regression while retaining
the retirement controls.
