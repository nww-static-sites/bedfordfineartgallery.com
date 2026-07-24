import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const homepagePath = new URL('../components/home/HomeRedesign.vue', import.meta.url)
const marqueePath = new URL('../components/home/HomeImageMarquee.vue', import.meta.url)

const [homepage, marquee] = await Promise.all([
    readFile(homepagePath, 'utf8'),
    readFile(marqueePath, 'utf8'),
])

assert.equal(
    homepage.includes('Bedford Fine Art Gallery customer with fine art'),
    false,
    'Homepage still contains the repeated customer-image alt text.'
)
assert.match(
    homepage,
    /<HomeImageMarquee[\s\S]*?variant="customers"[\s\S]*?\bdecorative\b[\s\S]*?\/>/,
    'Homepage customer marquee must opt into decorative mode.'
)
assert.match(
    homepage,
    /customerImages\(\)[\s\S]*?alt:\s*''/,
    'Homepage customer image records must use empty alt text.'
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

console.log('Customer image alt-text source verification passed.')
