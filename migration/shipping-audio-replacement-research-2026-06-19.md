# Shipping audio replacement research - 2026-06-19

## Request

Jerry reported negative feedback on the audio under
`Click play below to learn about our shipping options:` and asked for a less
robotic, more human-sounding replacement using the same exact text, with a
preview before going live.

## Current implementation

- `pages/index.vue` and `pages/painting.vue` both render the same audio player.
- Current source:
  `static/images/luvvoice.com-20251201-j23UN4.mp3`
- Public URL:
  `https://www.bedfordfineartgallery.com/images/luvvoice.com-20251201-j23UN4.mp3`
- Current public file metadata from `curl`/`file`:
  - HTTP `200`
  - `audio/mpeg`
  - about `442K`
  - MPEG Layer III, `48 kbps`, `24 kHz`, mono

The exact script text was not found as plain text in the repo. To preserve the
exact wording, either get the original script from Jerry/Joan/Shawn or transcribe
the current audio and have Jerry/Joan verify it before generation.

## Recommended workflow

1. Confirm the exact script text.
2. Generate 3-5 candidate voiceovers using a higher-quality TTS provider.
3. Save candidates outside the live player first, such as in `migration/audio-preview/`
   or a non-public preview page.
4. Let Jerry choose one.
5. Replace the site audio file/path only after approval.
6. Verify the home page and painting detail pages use the selected audio.

## Provider notes

OpenAI's Text-to-Speech API supports `gpt-4o-mini-tts`, instructions for tone,
and built-in voices. The docs recommend `marin` or `cedar` for best quality.
The docs also say end users need clear disclosure when the TTS voice is
AI-generated.

A human voice actor is still the highest-quality option for warmth and trust,
especially for an art gallery. AI TTS is the fastest and cheapest path for a few
approval candidates.
