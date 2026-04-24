# `/admin/` freeze

## What changed

`static/admin/index.html` now renders a temporary maintenance page instead of loading Netlify Identity and Netlify CMS.

The public site is not changed. The CMS configuration remains in `static/admin/config.yml` so the freeze can be reversed cleanly.

## How the freeze is enabled

The freeze is enabled by deploying this branch with the edited `static/admin/index.html`.

Because `/admin/` is served from the static admin file, Joan will see the pause message instead of the Netlify CMS editor. The CMS JavaScript is not loaded, so editor access is blocked at the page level during migration.

## How to remove the freeze

Restore the original Netlify CMS admin page by changing `static/admin/index.html` back to loading these scripts:

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
```

Then deploy the revert commit.

## Deployment implications

Netlify auto-deploys from the GitHub repository. Pushing this branch alone should not affect production unless Netlify is configured to deploy branch previews. Merging or pushing the freeze change to the production branch will make `/admin/` unavailable until the freeze is reverted.

Keep the freeze active through export, upload, rewrite, and cutover verification so CMS edits cannot conflict with migrated image references.
