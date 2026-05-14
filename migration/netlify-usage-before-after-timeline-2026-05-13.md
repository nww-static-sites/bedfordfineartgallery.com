# Netlify usage before/after timeline - 2026-05-13

## Question answered

The operator asked:

- When did the production site first publish the Cloudinary-to-S3 image migration?
- When did the Netlify CMS publish workflow change go live?
- How long ago were those changes?
- Has Netlify usage gone down since those changes?
- Did anything we added create new usage?

This note uses:

- local project notes
- `origin/main` Git history fetched on 2026-05-13
- Netlify deploy API for site `50e4dd76-2749-40f0-bad3-310eb125bb8a`
- Netlify account bandwidth endpoint for team `nww`

## Milestone dates

All UTC times are from Netlify deploy records. Phoenix/MST is UTC-7.

### Image migration production cutover

The Cloudinary-to-S3 rewrite work was committed on 2026-04-24 and preview-tested in PR/deploy-preview form, but it did not show up as a production deploy until the evening of 2026-05-04 Phoenix time.

First production deploy that included the earlier S3 image rewrite commits:

- Deploy created: `2026-05-05T02:20:03.397Z`
- Phoenix time: `2026-05-04 19:20:03 MST`
- Commit: `f3cae8e1`
- Title: `Keep preview builds working if featured DB times out`
- State: `ready`
- Deploy time: `257` seconds

Follow-up production deploy that explicitly says CMS was reactivated after cutover:

- Deploy created: `2026-05-05T02:27:20.490Z`
- Phoenix time: `2026-05-04 19:27:20 MST`
- Commit: `75911928`
- Title: `Reactivate Netlify CMS after migration cutover`
- State: `ready`
- Deploy time: `259` seconds

As of the 2026-05-13 15:54 MST usage check, the first production image cutover deploy was about `8 days 20 hours` old.

### CMS publish workflow production rollout

The basic workflow change went live on 2026-05-05 Phoenix morning:

- Deploy created: `2026-05-05T16:17:20.786Z`
- Phoenix time: `2026-05-05 09:17:20 MST`
- Commit: `9521e9e5`
- Title: `Batch CMS publishes behind manual deploy`
- State: `ready`
- Deploy time: `263` seconds

The build-hook implementation followed minutes later:

- Deploy created: `2026-05-05T16:23:50.220Z`
- Phoenix time: `2026-05-05 09:23:50 MST`
- Commit: `97c5fc18`
- Title: `Use build hook for CMS publish`
- State: `ready`
- Deploy time: `268` seconds

The final visible polish/hardening deploy from that initial workflow session:

- Deploy created: `2026-05-05T19:58:28.052Z`
- Phoenix time: `2026-05-05 12:58:28 MST`
- Commit: `888d7241`
- Title: `Relabel CMS entry publish as save`
- State: `ready`
- Deploy time: `261` seconds

As of the 2026-05-13 15:54 MST usage check:

- basic workflow rollout was about `8 days 6 hours` old
- final workflow polish/hardening was about `8 days 2 hours` old

## Production deploy usage by period

Current Netlify billing period from account bandwidth endpoint:

- `2026-04-15T00:00:00.000-07:00` through `2026-05-15T00:00:00.000-07:00`

Production deploy records in that period, split by project phase:

| Period | Window | Ready deploys | Error deploys | Ready build time | Ready deploys/day | Ready build minutes/day |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Before image cutover | 2026-04-15 00:00 MST to 2026-05-04 19:20 MST | 7 | 0 | 27.4 min | 0.35/day | 1.4/day |
| Migration/cutover burst before workflow | 2026-05-04 19:20 MST to 2026-05-05 09:23 MST | 13 | 0 | 56.3 min | 22.2/day | 96.0/day |
| After workflow start | 2026-05-05 09:23 MST to 2026-05-13 15:54 MST | 18 | 2 | 74.4 min | 2.18/day | 9.0/day |
| After final workflow hardening | 2026-05-05 12:58 MST to 2026-05-13 15:54 MST | 13 | 1 | 52.9 min | 1.60/day | 6.5/day |

Interpretation:

- The migration itself caused a short, very high deployment burst on 2026-05-04/2026-05-05.
- After the workflow change settled, deploy usage dropped massively compared with the migration burst.
- Compared with the quiet pre-migration period, deploy usage is still higher, mostly because editors/operators have been actively publishing batches after the workflow was introduced.

## Did the workflow reduce full publishes?

Yes, for CMS-save-triggered deploys.

After the final workflow hardening deploy on 2026-05-05 12:58 MST:

- Git commits on `origin/main`: `28`
- Commits with `[skip netlify]`: `28`
- Non-skip commits: `0`
- Production deploy records: `14`
- Ready production deploys: `13`
- Error production deploys: `1`
- Hook-triggered deploy records: `14`

Under the old CMS behavior, those `28` CMS commits would likely have produced about `28` automatic production deploy records. The new workflow produced `14` production deploy records instead, all via the manual `CMS Publish Site` hook.

So for this post-hardening sample:

- deploy count was reduced by roughly `50%` versus one deploy per CMS commit
- ready deploys were reduced from a likely `28` to `13`
- rough ready build time was about `52.9` minutes
- if all 28 commits had auto-deployed at the observed average of about 244 seconds, build time would have been about `114` minutes
- rough avoided ready build time: about `61` minutes

This is a real improvement, but not as large as it could be, because `Publish Site` is still being clicked fairly often.

## Bandwidth and request usage answer

The API-visible bandwidth number is only team-wide for the current billing period:

- Team bandwidth used: `33,255,540,901` bytes, about `33.26 GB`
- Period: 2026-04-15 through 2026-05-15

The API endpoint did not expose:

- Bedford-only bandwidth
- daily bandwidth
- historical bandwidth for previous billing periods
- web request usage
- Functions invocation usage
- Blobs usage

Attempts to query site-specific or historical bandwidth through nearby API paths did not return useful data:

- `accounts/nww/bandwidth?site_id=...` returned the same team-wide value
- `sites/:id/bandwidth`, `sites/:id/traffic`, `sites/:id/stats`, and `sites/:id/analytics` returned `404`
- date parameters on the account bandwidth endpoint did not return a valid previous-period number

Conclusion:

- We can confidently say image bandwidth should be structurally lower because image delivery moved from Netlify/Cloudinary-era site assets to `img.bedfordfineartgallery.com` on S3/Cloudflare.
- We cannot prove from this API snapshot that Bedford bandwidth has gone way down, because the available number is current-period, team-wide, and not broken out by site or day.
- The Netlify dashboard is required for a real bandwidth/request before-after answer: `Usage & billing > Account usage insights` and `Credit usage breakdown`.

## Possible new usage introduced

The workflow added some Netlify usage, but it should be small compared with full production deploys and image bandwidth:

- `publish-site` Function:
  - CMS admin panel polls `GET /.netlify/functions/publish-site` every 30 seconds while an authenticated CMS session is open.
  - A publish click sends `POST /.netlify/functions/publish-site`.
  - This creates Function invocations and Netlify API calls.
- `s3-upload` Function:
  - CMS image uploads pass through this Function.
  - Files over about `2.5 MB` are chunked.
- Netlify Blobs:
  - temporarily stores large upload chunks before S3 assembly.
  - stores a small publish-state record to avoid duplicate publishes.

Risk note:

- If editors leave multiple CMS tabs open all day, the 30-second status polling can create a steady background stream of Function invocations.
- This is probably not the main bill driver, but it is the one new always-on-ish usage pattern created by the workflow.

## Practical answer

1. The S3/no-Cloudinary production cutover happened on `2026-05-04 19:20 MST`, with a follow-up CMS reactivation at `19:27 MST`.
2. The CMS publish workflow began production rollout on `2026-05-05 09:17 MST`; build-hook behavior was live at `09:23 MST`; final initial polish was live at `12:58 MST`.
3. As of the 2026-05-13 15:54 MST usage check, those changes were about 8-9 days old.
4. Full production deploy usage went way down compared with the migration burst.
5. Full production deploy usage is lower than the old CMS-save-per-deploy model would have been after 2026-05-05, but manual publish clicks are still frequent enough that deploys are not rare.
6. Bandwidth probably went down structurally because images moved off Netlify, but this cannot be proven from the API data available here; the Netlify dashboard usage breakdown is needed.

