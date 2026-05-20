# CMS slug normalization - 2026-05-20

## Why this was done

The CMS uses JSON filenames as stable entry ids. Public page generation and
cross-entry relations are safest when each entry's `slug` value matches that
file id exactly. Legacy content had many cases where the JSON `slug` field had
drifted away from the filename, usually from older `.html` / `-html` conventions
or hand-edited slug text.

This matters because a slug mismatch can make one part of the site link to one
URL while the generated page or related CMS entry expects another value. The
Edgar Longstaffe missing detail page was caused by a related flavor of this
problem: a relation pointed at a value that looked plausible in the CMS but was
not the real entry id.

## What changed

The original inventory found 193 slug/file-id mismatches. Most were normalized
by changing the `slug` field to match the JSON filename:

- `cms/paintings`: 6 entries
- `cms/articles`: 82 entries
- `cms/artLoversNicheArticles`: 104 entries
- `cms/artists`: already clean, 0 changed

Total normalized entries: 192.

No CMS files were renamed. This was intentional: the filename is the stable CMS
entry id, so the data value was corrected to match the file instead of moving
files around.

One painting mismatch was not normalized because it exposed a true duplicate:

- Removed `cms/paintings/louis_frederick_berneker_artist-html.json`

That file contained the same painting content as
`cms/paintings/louis_frederick_berneker_pan_with_wood_nymphs-html.json`, was not
referenced by the artist entry, and would have collided with the real artist page
at `/louis_frederick_berneker_artist.html` if normalized.

## Redirect preservation

Most old slug values generated the same public URL after Nuxt's historical
`slug.replace('-html', '.html')` route transformation. Nineteen old slug values
generated distinct public URL variants. Of those, 12 variants still resolve
because another static file, case-insensitive serving, or duplicate legacy entry
already produces that path after normalization.

Eight variants would otherwise become missing URLs, so redirects were added to
`static/_redirects` under:

`# CMS slug normalization redirects - 2026-05-20`

These redirects keep old public URLs resolving while canonicalizing to the
filename-based URL.

## New guardrail

`validate-cms-relations.mjs` now checks slug/file-id equality for:

- artists
- paintings
- articles
- art lovers niche articles

The validator is already part of `yarn run generate`, so future drift should
fail the build clearly before publishing broken links.

It also checks for public route collisions across those collections so a painting
cannot silently overwrite an artist, article, or other generated page.

## Related prior work

- `migration/cms-relation-validation-2026-05-20.md`
- `migration/cms-slug-protection-2026-05-20.md`
