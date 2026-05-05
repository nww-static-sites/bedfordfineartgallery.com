# CMS publish workflow

## Goal

Reduce Netlify build usage from CMS editing without changing where content lives.

Editors can save multiple CMS changes to Git, then click a separate Publish Site
button when they are ready for one production deploy.

## Current implementation

- `static/admin/config.yml` uses Git Gateway on `main`.
- CMS commit messages include `[skip netlify]`, so ordinary CMS saves do not
  trigger Netlify automatic deploys.
- `static/admin/bedford-publish-site.js` adds a publish status panel for logged-in
  CMS users and polls the server every 30 seconds.
- `netlify/functions/publish-site.js` validates the Netlify Identity user and
  compares GitHub `main` with the latest successful Netlify production deploy.
- When GitHub has unpublished commits, the button enables and can start one
  Netlify build through a dedicated Netlify build hook.
- When Netlify is already building, or when the live site matches GitHub, the
  function blocks extra publish attempts.

## Netlify environment variables

- `BEDFORD_NETLIFY_BUILD_HOOK_URL`: Netlify build hook URL used server-side to trigger a build.
- `BEDFORD_NETLIFY_SITE_ID`: Bedford Netlify site ID used for publish status.
- `BEDFORD_NETLIFY_STATUS_TOKEN`: optional Netlify API token for reading deploy status.
- `BEDFORD_CMS_PUBLISH_EMAILS`: comma-separated list of CMS users allowed to publish.

## Editor-facing behavior

Saving an entry commits the JSON content file to GitHub but does not publish the
public site. The CMS panel shows whether the live site is current, publishing, or
has saved changes waiting. When the editing batch is ready, click Publish Site in
the CMS admin.

Netlify usually takes 7-10 minutes to build and publish the public site.

## Notes

The image upload workflow is separate. Image files upload to the AWS bucket and
the CMS stores the public `img.bedfordfineartgallery.com` URL in Git.
