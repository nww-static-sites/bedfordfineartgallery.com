# GitHub rate-limit incident - 2026-05-13

## Report

Joan reported this CMS error while adding Henry Hintermeister and the painting
`Sail On O ship of State`:

```text
API rate limit exceeded for 98.93.56.208. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)
```

## Finding

This is GitHub's unauthenticated REST API rate-limit message.

The likely source is the custom CMS publish status function:

- `static/admin/bedford-publish-site.js`
- `netlify/functions/publish-site.js`

The browser CMS panel polls `/.netlify/functions/publish-site`, and the Netlify
Function checks GitHub to compare the latest GitHub `main` commit with the latest
successful Netlify production deploy. Before this fix, those GitHub REST calls
were unauthenticated.

GitHub's unauthenticated rate limit is low and shared by source IP. The reported
IP is likely the public IP seen by GitHub for these requests. Multiple CMS tabs,
focus refreshes, or repeated status polling can hit the limit.

## Henry publish state

Recent GitHub commits:

- `d353b9f1` - `2026-05-13T21:22:43Z` - Create Artist `henry_hintermeister_artist-html` `[skip netlify]`
- `d310ce8c` - `2026-05-13T21:27:45Z` - Update Artist `henry_hintermeister_artist-html` `[skip netlify]`
- `d23d73e1` - `2026-05-13T21:43:57Z` - Create Painting `henry_hintermeister_sail_on_oh_ship_of_state-html` `[skip netlify]`

Latest Netlify production deploy checked:

- `d353b9f1`
- Deploy created: `2026-05-13T21:23:04.330Z`
- State: `ready`
- Title: `Deploy triggered by hook: CMS Publish Site`

So the Henry artist create was published, but the later artist update and the
painting create were saved after the latest production deploy and still need a
successful `Publish Site` deploy.

## Code change made

Updated `netlify/functions/publish-site.js`:

- supports authenticated GitHub API calls with `BEDFORD_GITHUB_TOKEN` or `GITHUB_TOKEN`
- uses the token only server-side, never in browser JavaScript
- returns a clearer CMS-facing message when GitHub rate limiting is detected
- caches GET publish-status responses in Netlify Blobs for `60` seconds by default
- clears the cache before starting a publish

Updated `static/admin/bedford-publish-site.js`:

- changed status polling from every `30` seconds to every `120` seconds

Syntax check passed:

```bash
node --check netlify/functions/publish-site.js
node --check static/admin/bedford-publish-site.js
```

## Required Netlify configuration

Added this environment variable in Netlify on 2026-05-13:

- `BEDFORD_GITHUB_TOKEN`

Netlify API verification after creation:

- key exists
- contexts: `all`
- scopes returned by API: `builds`, `functions`, `post_processing`, `runtime`
- `is_secret: false`

Important caveat:

- The API rejected creating this as a secret on the current account because
  secrets cannot run in `post_processing` scope, and the account also rejected
  API-created granular scopes with `Upgrade your Netlify account to set specific
  scopes`.
- Existing sensitive variables on this site, including AWS credentials, are also
  currently stored as non-secret Netlify environment variables.
- Prefer rotating this into a fine-grained read-only token and/or marking it as a
  secret through the Netlify UI if the UI allows selecting only build/functions/runtime
  scopes.

Token requirements:

- fine-grained GitHub personal access token is preferred
- repository: `nww-static-sites/bedfordfineartgallery.com`
- read-only repository contents/metadata access is enough for:
  - `GET /repos/:owner/:repo/commits/:branch`
  - `GET /repos/:owner/:repo/compare/:base...:head`
- ideally scope it to Functions/runtime in Netlify if the plan/UI supports it
- do not expose it to browser JavaScript
- do not commit the token value

After adding the variable, deploy the code change. The local code change has been
rebased onto `origin/main` after Joan's Henry commits.

## Suggested response to Joan

The content save appears to have worked. The error came from the CMS publish
status checker hitting GitHub's unauthenticated API limit, not from a bad artist
or painting record. The later Henry changes still need to be published after the
rate-limit fix deploys.
