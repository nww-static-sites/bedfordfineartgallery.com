# Netlify credit run-rate forecast - 2026-05-13

## Operator context added

- Other Netlify projects under the team are dormant for practical usage purposes.
- Treat current team-wide usage as Bedford usage unless dashboard evidence says otherwise.
- Before the migration, images were hosted by Cloudinary, not Netlify.
- Therefore the Cloudinary-to-S3 move probably did not reduce Netlify bandwidth much; the main measurable Netlify usage reduction is from the CMS publish workflow.
- The account is believed to be on the `$9/month` Personal-style plan with auto recharge enabled.
- Joan is the main CMS editor. Jerry and Joan own the gallery.

## Current billing cycle

Netlify bandwidth API returned:

- Period start: `2026-04-15T00:00:00.000-07:00`
- Period end: `2026-05-15T00:00:00.000-07:00`
- Current bandwidth used at latest check: `33,282,310,270` bytes, about `33.28 GB`
- Latest bandwidth update: `2026-05-13T23:46:12.927Z`, about `2026-05-13 16:46 MST`

So the current cycle ends at:

- `2026-05-15 00:00 MST`

As of the latest check, about `28.7` of `30` days had elapsed in the cycle.

## Verified plan/auto-recharge signals

Netlify account API returned:

- `credits.included: 1000`
- `credit_features.included: true`
- `auto_topup_amount.included: "500.00"`
- `auto_topup_per_unit_cost_basis.included: "0.01"`
- `auto_topup_threshold.included: "10.00"`

This matches the current public Personal plan structure:

- Personal: `$9/month`
- Included credits: `1,000/month`
- Auto recharge: `500` credits for `$5` as needed

The REST API confirms the credit package/rate shape but did not expose a clear boolean for whether auto recharge is currently enabled. The operator says auto refill is set up.

## Current official credit rates checked

Current Netlify docs/pricing state:

- Production deploys: `15 credits` per successful production deploy
- Bandwidth: `20 credits` per GB
- Web requests: `2 credits` per `10,000` requests
- Compute: `10 credits` per GB-hour
- Build minutes are not a separate credit-based metric

## Current-cycle estimate

Known measurable usage in current billing cycle:

- Bandwidth: `33.28 GB`
- Bandwidth credits at current rate: about `666`
- Production deploy records: `40`
- Successful production deploys: `38`
- Error deploys: `2`
- Successful production deploy credits: `38 * 15 = 570`

Known subtotal by current public credit rates:

- `666 + 570 = 1,236` credits before web requests and compute

Projected bandwidth by cycle end:

- Current pace: about `1.16 GB/day`
- Projected full cycle bandwidth: about `34.79 GB`
- Projected bandwidth credits: about `696`

If there are no more successful production deploys before cycle end, known projected subtotal is roughly:

- `696 bandwidth credits + 570 deploy credits = 1,266 credits`

This suggests the account is likely to need at least one Personal auto-recharge pack in the current cycle if current public credit rates apply exactly.

## May 6 through May 13 run-rate

Window used:

- `2026-05-06T00:00:00Z` through `2026-05-14T00:00:00Z`
- 8 calendar days

Activity:

- CMS/content commits: `28`
- All 28 commits included `[skip netlify]`
- Production deploy records: `14`
- Successful production deploys: `13`
- Error deploys: `1`
- All deploy records were `Deploy triggered by hook: CMS Publish Site`

Monthly projection from this 8-day window:

- Successful deploys per day: `1.625`
- Projected successful deploys per average month: about `49.5`
- Projected deploy credits: about `742/month`

Bandwidth projection from current cycle pace:

- About `35.3 GB/month`
- About `706 credits/month`

Forward-looking subtotal if May 6-13 behavior is typical:

- `742 deploy credits + 706 bandwidth credits = 1,448 credits/month`
- This excludes web requests and compute.

Conclusion:

- At this run-rate, Bedford likely does not fit inside the `$9/month` Personal plan's included `1,000` credits.
- It likely needs at least one `$5 / 500 credit` auto recharge pack, and possibly more if web requests or Function compute are meaningful.
- It is not a realistic fit for the Free plan because projected bandwidth alone is about `706 credits/month`, above the Free plan's `300` credit limit.

## Does Joan appear to publish once at the end of the day?

Not consistently.

The activity looks human and CMS-driven, not automated. However, the deploy records show multiple manual publish clicks on several active days:

- 2026-05-06: 1 commit, 1 publish
- 2026-05-07: 1 commit, 0 publishes
- 2026-05-09: 6 commits, 4 publishes
- 2026-05-11: 9 commits, 2 publish records, 1 successful and 1 error
- 2026-05-12: 4 commits, 3 publishes
- 2026-05-13: 7 commits, 4 publishes

This pattern suggests Joan or another editor/operator often publishes during the editing session, not just once at the end of the day. The new workflow is still working because every CMS save has `[skip netlify]`; the remaining optimization is behavioral: batch more changes before clicking `Publish Site`.

## What would fit better?

Scenario estimates, using current docs rates and projected bandwidth around `706 credits/month`:

| Publish habit | Approx successful deploys/month | Deploy credits | Bandwidth credits | Subtotal before requests/compute | Likely Personal fit |
| --- | ---: | ---: | ---: | ---: | --- |
| Current May 6-13 pace | ~49.5 | ~742 | ~706 | ~1,448 | No, needs auto recharge |
| One publish per active editing day, if 6 active days per 8 calendar days continues | ~22.8 | ~342 | ~706 | ~1,048 | Borderline/no, likely one recharge after requests |
| Two publishes per week | ~8.7 | ~130 | ~706 | ~836 | Possibly, depends on requests |
| One publish per week | ~4.3 | ~65 | ~706 | ~771 | More likely, depends on requests |

Because web requests also consume credits, a safe target is probably no more than a few production publishes per week unless the dashboard shows web request credits are tiny.

## Practical recommendations

1. Keep the new CMS workflow. It is preventing automatic deploys on every save.
2. Coach Joan to click `Publish Site` once after a real batch, not after each painting field or related record.
3. If possible, change the CMS panel copy to gently discourage repeat publishes, for example: `Publish Site` plus helper text such as `Use once after finishing today's edits.`
4. Consider increasing the server cooldown or adding a same-day warning if multiple publishes happen close together.
5. Check Netlify dashboard `Usage & billing > Credit usage breakdown` to verify actual web request and compute credits, which the REST API did not expose.
6. Do not downgrade to Free unless traffic drops dramatically; current Bedford bandwidth alone appears too high.

