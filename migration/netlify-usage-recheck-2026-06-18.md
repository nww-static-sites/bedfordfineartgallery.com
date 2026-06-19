# Netlify usage recheck - 2026-06-18

Checked: 2026-06-18 13:49 MDT

## Context loaded

- `migration/context-signal.md`
- `migration/netlify-credit-run-rate-forecast-2026-05-13.md`
- `migration/github-rate-limit-incident-2026-05-13.md`
- `../bedford-slug-normalization-deploy-2026-05-20.md`

## Current account and billing-cycle signals

Netlify account/site API state:

- Account slug: `nww`
- Account name: `Nittany Web Works`
- Bedford site id: `50e4dd76-2749-40f0-bad3-310eb125bb8a`
- Included credits exposed by account API: `1000`
- Collaborators exposed by account API: `1` included, `1` used

Current bandwidth API response:

- Period start: `2026-06-15T00:00:00.000-07:00`
- Period end: `2026-07-15T00:00:00.000-07:00`
- Last updated: `2026-06-18T19:45:21.767+00:00`
- Bandwidth used: `2,391,136,841` bytes, about `2.39 GB`
- Bandwidth credits so far at `20 credits/GB`: about `47.8`

Projection from the current partial cycle:

- Elapsed cycle time at last update: about `3.53` days of a `30` day cycle
- Projected bandwidth: about `20.3 GB`
- Projected bandwidth credits: about `406`

Important limitation:

- The Netlify REST API exposed only the current team bandwidth period, not a
  historical May 15-June 15 bandwidth breakdown. The Netlify dashboard
  `Usage & billing` view is still required for a true prior-cycle bandwidth and
  web-request/compute credit breakdown.

## Deploy usage

Credit rule used: successful production deploys cost `15` credits. Failed
deploys do not consume deploy credits.

### May 15-June 15 cycle

Window: `2026-05-15T07:00:00Z` through `2026-06-15T07:00:00Z`

- Production deploy records: `35`
- Successful production deploys: `35`
- Failed/error production deploys: `0`
- CMS publish hook deploys: `23`
- Non-hook/code deploys: `12`
- Deploy credits: `525`
- Total successful deploy runtime: `8,761` seconds, about `146` minutes

Deploys by day:

| Date | Successful deploys | Notes |
| --- | ---: | --- |
| 2026-05-18 | 4 | CMS publish hook |
| 2026-05-19 | 4 | CMS publish hook |
| 2026-05-20 | 7 | 4 CMS publish hook, 3 code deploys for relation/slug work |
| 2026-05-21 | 1 | CMS publish hook |
| 2026-05-22 | 3 | CMS publish hook |
| 2026-05-24 | 1 | CMS publish hook |
| 2026-05-25 | 2 | CMS publish hook |
| 2026-05-27 | 9 | 8 GitHub/code edits plus 1 CMS publish hook |
| 2026-05-28 | 3 | CMS publish hook |
| 2026-06-02 | 1 | GitHub/code edit |

Git commit check for the same cycle:

- Total commits on `origin/main`: `62`
- Commits with `[skip netlify]`: `50`
- Commits without `[skip netlify]`: `12`
- CMS-like commits: `58`
- Active commit days: `15`

Interpretation:

- The CMS workflow was working: ordinary content commits mostly included
  `[skip netlify]` and did not automatically build.
- The deploy cost was still meaningful because Joan or an operator clicked
  `Publish Site` 23 successful times in the month, and because there was a burst
  of code-level work that naturally triggered 12 production deploys.
- The May 6-May 13 pre-recheck forecast projected about `49.5` successful
  deploys/month or about `742` deploy credits/month. The observed May 15-June 15
  month was lower at `35` successful deploys and `525` deploy credits.

### Current June 15-July 15 cycle to date

Window checked: `2026-06-15T07:00:00Z` through latest deploy log on
2026-06-18.

- Production deploy records: `1`
- Successful production deploys: `1`
- CMS publish hook deploys: `0`
- Non-hook/code deploys: `1`
- Deploy credits so far: `15`

Current-cycle commits on `origin/main`:

- Total commits: `7`
- Commits with `[skip netlify]`: `6`
- Commits without `[skip netlify]`: `1`
- Active commit days: `3`

Current-cycle deploy projection if the first 3.53 days repeated for the full
30-day cycle:

- Projected successful production deploys: about `8.5`
- Projected deploy credits: about `127`

The one current-cycle deploy was:

- `2026-06-15T11:56:26.611Z` - `Update index.vue` - `c964d807`

The current-cycle content commits after that have `[skip netlify]`, so they are
not causing automatic deploys.

## Known-credit forecast

Current June 15-July 15 run-rate:

- Projected bandwidth credits: about `406`
- Projected deploy credits: about `127`
- Known projected subtotal before web requests and compute: about `534` credits

This is much healthier than the May 13 forecast:

- May forecast known subtotal: about `1,448` credits/month before web requests
  and compute
- Current-cycle known subtotal projection: about `534` credits/month before web
  requests and compute

That suggests Bedford is now likely within the `1000` included credits on the
Personal plan if web request and compute credits are not unusually large.

The Free plan is still not a good target:

- Free includes `300` credits/month.
- Current bandwidth projection alone is about `406` credits, before any deploys,
  web requests, or compute.

## Support/rate-limit fix check

The Netlify site environment variable list still contains:

- `BEDFORD_GITHUB_TOKEN`
- Scopes: `builds`, `functions`, `post_processing`, `runtime`
- Context: `all`
- Value exists: yes

On the later CMS status investigation the token value existed but GitHub returned
`401 Bad credentials`, so the variable should be replaced when a fresh GitHub
token is available.

## Conclusion

Further emergency billing action does not appear necessary from API-visible
usage. The big improvement is that content commits are continuing to skip
Netlify deploys, and the current cycle had only one production deploy so far.

The remaining unknown is web request and compute credit usage. Check Netlify's
dashboard `Usage & billing` / credit breakdown before making a billing change.

