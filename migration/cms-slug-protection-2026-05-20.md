# CMS slug protection - 2026-05-20

## Goal

Make slug fields effectively "do not touch" after an entry is created.

This protects public URLs and CMS relations for artists, paintings, articles,
and Art Lovers Niche articles without changing any existing legacy URLs.

## Implementation

`static/admin/bedford-publish-site.js` now installs two protections for existing
CMS entries:

- The visible slug input is made read-only and styled as protected.
- A CMS `preSave` event restores the original slug value captured when the
  existing entry editor opened.

New entries are not locked. Editors can still enter the initial slug while
creating a record. After the record exists, future CMS edits should preserve that
slug.

The CMS config hints for slug fields now explain that the field controls the
public URL and should go through the site maintainer if it ever needs to change.

## Why this is not full legacy cleanup

This protection intentionally preserves the slug value already present on an
existing record. Some older entries still have historic differences between
their file id, JSON slug, and/or public URL. Normalizing those requires a
separate redirect-aware cleanup so existing public URLs are not accidentally
changed.
