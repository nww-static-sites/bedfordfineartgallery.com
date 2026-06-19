# CMS GitHub authenticated rate-limit incident - 2026-06-19

## Report

Shawn saw this error while logged into the CMS:

```text
Failed to persist entry: API_ERROR: API rate limit exceeded for user ID 935847.
If you reach out to GitHub Support for help, please include the request ID
AF14:1B1E99:D3DB202:30EC8A58:6A35340D and timestamp 2026-06-19 12:20:37 UTC.
```

About an hour later, Shawn was able to complete the attempted CMS action.

## Findings

- GitHub user ID `935847` is the public GitHub account `srchulo` / Adam Hopkins.
- The current local Codex GitHub token identifies as `srchulo-nww`, not `srchulo`,
  and had almost all of its GitHub REST quota remaining when checked.
- The live CMS config uses `backend: name: git-gateway`, branch `main`.
- Netlify API confirms the site has Netlify Identity and Netlify Git Gateway
  enabled. Git Gateway is configured for
  `nww-static-sites/bedfordfineartgallery.com`.
- Netlify docs now mark Git Gateway as deprecated. Existing configurations still
  work, but new Git Gateway configurations are not recommended and Netlify says
  they will no longer fix ordinary bugs in the feature.
- GitHub's REST API primary limit for authenticated user requests is 5,000
  requests per hour. The error mentions a GitHub user ID instead of an IP
  address, so this was an authenticated-user limit, not the earlier
  unauthenticated-IP limit.

## Interpretation

This error came from the CMS persistence path: Netlify CMS/Decap CMS saves the
edited JSON file by calling Netlify Git Gateway, and Git Gateway proxies that to
GitHub. It is separate from the custom `Publish Site` button. The manual publish
workflow reduces Netlify deploys, but CMS saves still use GitHub API calls.

Because the exhausted GitHub identity was `srchulo`, the inherited Netlify/Git
Gateway connection appears to still depend on Adam's GitHub-side authorization or
token. The one-hour recovery matches GitHub's hourly primary rate-limit window.

Bedford also has large CMS collections:

- `cms/paintings`: 873 JSON files
- `cms/artists`: 403 JSON files

Relation widgets between artists and paintings can cause the CMS to read/list
many entries through Git Gateway while editors browse or save, which can consume
GitHub API quota faster than the CMS UI makes obvious.

## Existing custom-status traffic

The custom CMS publish panel uses `/.netlify/functions/publish-site`.

Current mitigation already in place:

- browser polling interval is 120 seconds
- server-side status cache is 60 seconds
- GitHub calls are server-side only

This panel can still use GitHub API quota, but the specific error text
`Failed to persist entry` points to the CMS save path rather than the status
panel.

## Recommended next actions

1. Decide whether to keep Git Gateway short-term or plan a CMS backend migration,
   because Git Gateway is deprecated.
2. Add friendlier CMS guidance for rate-limit failures: if the error appears,
   stop retrying repeatedly and wait for the reset window.
3. Consider reducing GitHub API usage from CMS relation widgets or replacing the
   large relation-widget reads with a generated local index/custom widget if this
   recurs.
4. Optionally make the custom publish-status panel even quieter so it cannot
   materially contribute to GitHub API consumption.

## Fixes applied

Applied on 2026-06-19:

- Rotated the Netlify Git Gateway service instance for this site to use the
  maintained `srchulo-nww` GitHub token. Netlify accepted the update with HTTP
  `204`, and a readback showed the Git Gateway instance updated at
  `2026-06-19T16:07:18.207Z`.
- Rotated the Netlify environment variable `BEDFORD_GITHUB_TOKEN` to the same
  maintained token for the custom CMS publish-status function. Netlify readback
  showed the env var updated at `2026-06-19T16:09:05Z`.
- Hardened `static/admin/bedford-publish-site.js` so focus/visibility changes
  coalesce overlapping status requests and refuse non-forced refreshes within
  60 seconds of the last status check.

Verification:

- The maintained token identifies as `srchulo-nww`.
- The token has admin/push/pull access to
  `nww-static-sites/bedfordfineartgallery.com`.
- The token can list `cms/paintings` and read `main`.
- `node --check static/admin/bedford-publish-site.js` passed.
- `node --check netlify/functions/publish-site.js` passed.

Limitations:

- Git Gateway hides the stored access token on readback, so the exact stored
  token cannot be displayed after rotation. Future confirmation should come from
  Shawn/Joan saving in the CMS without seeing user ID `935847` in a GitHub
  rate-limit error.
- The Netlify `BEDFORD_GITHUB_TOKEN` env var update requires a fresh deploy for
  deployed Functions to receive the new value.

## Deployment

The code hardening and notes were pushed as commit `79215dd9`
(`Rotate CMS GitHub auth and throttle status checks`) on 2026-06-19.

Netlify production deploy:

- deploy id: `6a3569fce842340008a87cc1`
- state: `ready`
- published at: `2026-06-19T16:14:48.860Z`
- deploy time: `250` seconds

Live checks after deploy:

- `https://www.bedfordfineartgallery.com/admin/` returned HTTP `200`.
- `https://www.bedfordfineartgallery.com/Artists--Bios.html` returned HTTP
  `200`.
- `https://www.bedfordfineartgallery.com/admin/bedford-publish-site.js` returned
  HTTP `200` and contains the new `minimumStatusRefreshMs` /
  `pendingStatusRefresh` throttling code.
