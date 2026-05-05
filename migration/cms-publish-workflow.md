# CMS publish workflow

## Goal

Reduce Netlify build usage from CMS editing without changing where content lives.

Editors can save multiple CMS changes to Git, then click a separate Publish Site
button when they are ready for one production deploy.

## Current implementation

- `static/admin/config.yml` uses Git Gateway on `main`.
- CMS commit messages include `[skip netlify]`, so ordinary CMS saves do not
  trigger Netlify automatic deploys.
- `static/admin/bedford-publish-site.js` adds a Publish Site button for logged-in
  CMS users.
- `netlify/functions/publish-site.js` validates the Netlify Identity user and
  starts one Netlify build through a dedicated Netlify build hook.

## Netlify environment variables

- `BEDFORD_NETLIFY_BUILD_HOOK_URL`: Netlify build hook URL used server-side to trigger a build.
- `BEDFORD_CMS_PUBLISH_EMAILS`: comma-separated list of CMS users allowed to publish.

## Editor-facing behavior

Saving an entry commits the JSON content file to GitHub but does not publish the
public site. When the editing batch is ready, click Publish Site in the CMS admin.

Netlify usually takes 7-10 minutes to build and publish the public site.

## Notes

The image upload workflow is separate. Image files upload to the AWS bucket and
the CMS stores the public `img.bedfordfineartgallery.com` URL in Git.
