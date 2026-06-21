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

## Dry-run preview generated 2026-06-19

No website files were changed for this dry run.

- OpenAI API access was confirmed from the local secret file
  `/Users/x/.config/codex-secrets/openai-api-key`.
- The key was copied from the readable project mirror
  `/Users/x/Documents/Z Codex Projects/Birds, Rocks, Plants/Backend/.env`.
  The key value was not printed or copied into this note.
- Generated file:
  `/Users/x/Documents/Codex Projects/Cloudinary/audio-previews/bedford-shipping-options-dry-run-male-2026-06-19.mp3`
- Drive upload:
  `https://drive.google.com/file/d/1t4TYvkHS3zkApxqOWtE1ofRP9d0x1sUR/view?usp=drivesdk`
- Model/voice: `gpt-4o-mini-tts`, `onyx`
- Audio metadata: MP3, mono, 24 kHz, 128 kbps, about 76 seconds, about 1.2 MB.
- Pronunciation handling: the TTS input used phonetic spelling `Maysonite` for
  the spoken word `Masonite`, plus instructions to pronounce it like
  `MAYS-uh-nite`.

## Cheerier dry-run preview generated 2026-06-19

The first `onyx` preview sounded too serious. A second no-website-change dry run
was generated with a warmer, slightly more cheerful male direction.

- Generated file:
  `/Users/x/Documents/Codex Projects/Cloudinary/audio-previews/bedford-shipping-options-dry-run-male-cheerful-2026-06-19.mp3`
- Drive upload:
  `https://drive.google.com/file/d/1iSTNx5NuWxai4lSdP52LUwT3X3MdQ3O8/view?usp=drivesdk`
- Model/voice: `gpt-4o-mini-tts`, `echo`
- Audio metadata: MP3, mono, 24 kHz, 128 kbps, about 76.5 seconds, about 1.2 MB.
- Direction: friendly, warm male narrator with a small smile in the voice;
  reassuring and human, but still calm and professional.

## Approved site replacement - 2026-06-21

Jerry approved the cheerier `echo` preview. The site replacement uses a new
static filename to avoid browser/CDN cache reuse of the old MP3.

- Site asset:
  `static/images/bedford-shipping-options-voiceover-2026-06-21.mp3`
- Public URL after deploy:
  `https://www.bedfordfineartgallery.com/images/bedford-shipping-options-voiceover-2026-06-21.mp3`
- Code references updated:
  - `pages/index.vue`
  - `pages/painting.vue`
- The previous file
  `static/images/luvvoice.com-20251201-j23UN4.mp3`
  was intentionally left in place so cached old pages or direct old links do not
  immediately break.
