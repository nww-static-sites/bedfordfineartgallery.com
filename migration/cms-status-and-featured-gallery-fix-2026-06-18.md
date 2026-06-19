# CMS status and featured gallery fix - 2026-06-18

## Client reports

Joan reported CMS edits showing a `Bad credentials` / status error around save
time for:

- `cms/paintings/claudius_schreyer_vion_bow_bugle_sheet_music-html.json`
- `cms/paintings/alfred_augustus_glendening_on_the_llugwy-html.json`

Jerry reported that the nine paintings in the red featured box at the top of
`/Artists--Bios.html` were no longer switching out daily.

## Findings

Joan's named edits did save to GitHub and were live on the public site:

- `16b2b35d` on 2026-06-06 changed the Claudius W. Schreyer record so the public
  title shows `Home Sweet Home`.
- `96e30d79` on 2026-06-08 changed `On the LLugwy, N. Wales` to `Sold`, removed
  the old highlights/comments, and cleared two image fields.
- Live checks on 2026-06-18 confirmed the public pages reflected those changes.

The scary CMS error was from the custom publish-status panel, not from the
content save itself. The Netlify env var `BEDFORD_GITHUB_TOKEN` existed, but a
GitHub API check using that token returned `401 Bad credentials`.

The featured red box was driven by `set-featured-painting-slugs.mjs`, which
selected nine available paintings at build time and then stored/reused the list
from the old `featured_paintings_of_the_week` database table. That meant the red
box could only change when a site build/publish happened. The script also used a
seven-day refresh interval, not daily.

## Fixes made

- `netlify/functions/publish-site.js` now retries GitHub status checks without
  the configured GitHub token when GitHub returns `Bad credentials`. That keeps
  Joan's CMS status panel from failing just because the token expired. The
  function remembers that state for the current instance so status polling does
  not repeatedly log the same warning.
- `components/Gallery.vue` now supports deterministic daily featured selection.
  For `/Artists--Bios.html`, the browser selects nine available paintings using
  the current `America/New_York` date. The same day gets the same nine paintings;
  the next day gets a new selection without requiring a Netlify deploy.
- `pages/artists-bios.vue` now passes all available paintings to the gallery and
  enables the daily featured selection.
- `package.json` no longer runs `set-featured-painting-slugs.mjs` during `dev`
  or `generate`, removing the old database dependency from normal builds.

## Follow-up note

The expired `BEDFORD_GITHUB_TOKEN` should still be replaced in Netlify when a
fresh GitHub token is available, because authenticated GitHub requests have
higher rate limits. The code fallback prevents the current user-facing failure.
