import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const marqueePath = new URL('../components/home/HomeImageMarquee.vue', import.meta.url)
const customerSliderPath = new URL('../components/CustomerSlidingImages.vue', import.meta.url)

const [marquee, customerSlider] = await Promise.all([
    readFile(marqueePath, 'utf8'),
    readFile(customerSliderPath, 'utf8'),
])

assert.match(
    customerSlider,
    /<HomeImageMarquee\b[^>]*\bvariant="customers"[^>]*\bdecorative\b[^>]*\/>/,
    'The shared customer scroller must opt into decorative mode.',
)
assert.match(
    marquee,
    /decorative:\s*\{[\s\S]*?type:\s*Boolean[\s\S]*?default:\s*false/,
    'HomeImageMarquee must expose an explicit decorative Boolean prop.'
)
assert.match(
    marquee,
    /:aria-hidden="decorative \? 'true' : null"/,
    'Decorative marquee content must be hidden from assistive technology.'
)
assert.match(
    marquee,
    /:alt="decorative \? '' : \(image\.alt \|\| ''\)"/,
    'Decorative marquee images must render explicit empty alt text.'
)

// eslint-disable-next-line no-console
console.log('Customer image alt-text source verification passed.')
