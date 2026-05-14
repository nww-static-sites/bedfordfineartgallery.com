# Netlify usage, billing, and support analysis - 2026-05-13

## Context loaded

- `CODEX_MIGRATION_INSTRUCTIONS.md`
- `README.md`
- `migration/test-results.md`
- `migration/cms-migration-plan.md`
- `migration/cutover-runbook.md`
- `migration/cms-upload-path-report.md`
- `migration/cms-publish-workflow.md`
- `migration/codex-handoff-2026-05-06.md`
- Current Netlify API state for site `50e4dd76-2749-40f0-bad3-310eb125bb8a`
- Current Netlify pricing, usage, billing, and support docs checked on 2026-05-13

## Current Netlify account and site facts

Netlify team/account:

- Account name: `Nittany Web Works`
- Account slug: `nww`
- Account ID: `5eaa3185bf43ea51bc4f08d8`
- Billing name returned by API: `Jay Davis`
- Site count visible to the current token: `10`
- Account capabilities include credit features, Identity, deploy URL hooks, background functions, traffic rules, analytics, logs API, and one included concurrent build.

Bedford site:

- Site ID: `50e4dd76-2749-40f0-bad3-310eb125bb8a`
- Netlify project name: `stupefied-ramanujan-ca1b24`
- Custom domain: `www.bedfordfineartgallery.com`
- Repo: `nww-static-sites/bedfordfineartgallery.com`
- Production branch: `main`
- Build command: `yarn run generate`
- Publish directory: `dist`
- Netlify API site plan value: `nf_team_pro`
- The repo has no `netlify.toml`; Netlify build settings currently come from the dashboard/API.

## Current Netlify product surface used by Bedford

Bedford is not just using Netlify as static file hosting:

- Static Nuxt generation and production deploys.
- Netlify Identity and Git Gateway for the CMS.
- Two Netlify Functions:
  - `publish-site`
  - `s3-upload`
- Netlify Blobs:
  - temporary chunks for large CMS image uploads
  - small shared publish-state record for the CMS publish button
- Build hook: CMS `Publish Site` triggers production deploys manually.
- CMS commit messages include `[skip netlify]` to avoid automatic deploys on normal CMS saves.

Images have been moved off Netlify delivery:

- Public image host is `https://img.bedfordfineartgallery.com`.
- New CMS uploads go to the S3-backed image host through `/.netlify/functions/s3-upload`.
- Image binaries are not committed to Git and are not stored in Netlify.
- This should materially reduce Netlify bandwidth compared with serving image-heavy gallery traffic from Netlify.

## Usage snapshot from Netlify API

Checked on: `2026-05-13 15:54:33 MST`

Billing period returned by bandwidth endpoint:

- Period start: `2026-04-15T00:00:00.000-07:00`
- Period end: `2026-05-15T00:00:00.000-07:00`
- Team bandwidth used: `33,255,540,901` bytes, about `33.26 GB` decimal.
- Included bandwidth from this API endpoint returned `null`, so use dashboard `Usage & billing` for the authoritative allowance and credit view.

Bedford deploys from the site deploy API, current billing period:

- Production deploy records since period start: `40`
- Ready production deploys since period start: `38`
- Error production deploys since period start: `2`
- Ready deploy time total: `9,484` seconds, about `158.1` minutes.
- Average ready deploy time: about `249.6` seconds, or `4.16` minutes.
- Hook-triggered ready production deploys in this period: `14`
- Non-hook ready production deploys in this period: `24`

Since `2026-05-05`, around the custom CMS publish workflow rollout:

- Production deploy records: `34`
- Ready production deploys: `32`
- Error production deploys: `2`
- Ready deploy time total: `8,096` seconds, about `134.9` minutes.
- Hook-triggered ready production deploys: `14`

Interpretation:

- The `[skip netlify]` plus `Publish Site` flow is working structurally, but the site is still seeing frequent production deploys.
- Several deploys on 2026-05-09 through 2026-05-13 are hook-triggered, so they likely came from editor/operator publish actions rather than automatic CMS save deploys.
- Build time is currently a performance concern but may not be a separate billing meter if the team is on credit-based pricing. If the team is actually on a legacy plan, build minutes still matter.

## Billing model risk

Netlify's current public pricing page says credit-based Pro is `$20/month` with `3,000 credits/month`, production deploys are `15 credits each`, compute is `10 credits per GB-hour`, bandwidth is `20 credits per GB`, and web requests are `2 credits per 10,000 requests`.

The API for this account reports:

- `credit_features.included: true`
- `credits.included: 1000`
- `auto_topup_amount.included: "500.00"`
- `auto_topup_per_unit_cost_basis.included: "0.01"`
- `auto_topup_threshold.included: "10.00"`
- site plan value `nf_team_pro`

This is inconsistent enough that the dashboard should be treated as the source of truth for the active plan. It may be a legacy/account-transition state, a Personal-like credit package under an older ID, or API fields that do not mirror the pricing page cleanly.

Rough credit math if this account is charged by the current credit meters:

- Team bandwidth at `33.26 GB * 20 credits/GB` is about `665 credits`.
- Bedford ready production deploys at `38 * 15 credits` is about `570 credits`.
- Bedford production deploy records including errors at `40 * 15 credits` would be about `600 credits`.
- Bedford deploys plus team bandwidth alone could be around `1,235` to `1,265` credits before web requests and compute, if those meters apply exactly and if the deploy count is billable in the same way.

Important limitations:

- The bandwidth number is team-wide, not Bedford-only.
- The deploy count is Bedford-only, not team-wide.
- The API probe did not return web request, compute, or full credit usage breakdown.
- Netlify's dashboard `Usage & billing > Credit usage breakdown` and `Account usage insights` are required for authoritative billing decisions.

## Support implications

The current implementation uses standard Netlify features in a way support should recognize:

- Build/deploy pipeline
- Identity and Git Gateway
- Functions
- Blobs
- Build hooks

Netlify's support scope says all plans have forums and private email support, while Enterprise customers can buy support packages with guaranteed response times. It also says support for custom code and advanced API usage is limited unless there is a custom contract.

For Bedford, expect Netlify support to help with:

- build failures
- deploy hook behavior
- Identity/Git Gateway activation problems
- Function deployment/runtime activation problems
- Blobs platform behavior
- billing and plan questions

Do not expect standard support to debug deeply:

- custom CMS JavaScript label replacement
- custom S3 upload implementation
- GitHub compare logic inside `publish-site.js`
- Cloudflare/S3 image delivery outside Netlify
- detailed custom API integration behavior

## Recommended actions

1. Confirm the active plan in the dashboard.
   - Go to `Usage & billing > Plan details`.
   - Record whether this is legacy Pro, credit-based Personal, credit-based Pro, or another transitional plan.
   - Record included monthly credits, auto recharge state, and credit pack/add-on state.

2. Check `Usage & billing > Credit usage breakdown`.
   - Capture current period totals for bandwidth, web requests, compute, production deploys, and AI inference.
   - Export or screenshot the chart if export is unavailable.

3. Check `Usage & billing > Account usage insights`.
   - Identify which of the 10 sites are consuming the team bandwidth and request volume.
   - Bedford may not be the main bandwidth driver now that image assets are off Netlify.

4. Reduce avoidable Bedford production deploys.
   - The custom CMS publish flow already stops deploys on every save.
   - Editors/operators should batch edits and click `Publish Site` once per editing session.
   - Add a social/process rule: no repeated publish clicks unless the CMS panel says changes are waiting.

5. Consider adding a lightweight deploy/usage note after major edit sessions.
   - Record date, CMS edits, publish clicks, resulting Netlify deploy ID, and whether the deploy was ready/error.
   - This will make future billing spikes easier to attribute.

6. Keep images off Netlify.
   - The S3/Cloudflare image path is the biggest structural bandwidth reduction already made.
   - Do not reintroduce repository media uploads or Netlify-served image assets for CMS uploads.

7. If opening Netlify support, include:
   - team slug `nww`
   - site ID `50e4dd76-2749-40f0-bad3-310eb125bb8a`
   - site name `stupefied-ramanujan-ca1b24`
   - custom domain `www.bedfordfineartgallery.com`
   - deploy IDs/examples
   - exact UTC timestamps
   - whether the issue is dashboard billing, deploy behavior, Identity/Git Gateway, Functions, or Blobs

## Source links checked

- Netlify pricing: https://www.netlify.com/pricing/
- Credit-based billing FAQ: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Monitor usage for credit-based plans: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/
- Legacy billing docs: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/billing-for-legacy-plans/
- Functions usage and billing: https://docs.netlify.com/build/functions/usage-and-billing/
- Netlify support scope: https://www.netlify.com/support-scope/

