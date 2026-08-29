import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import https from 'node:https'

const imageHost = 'https://img.bedfordfineartgallery.com/customer-images/'
const manifestPath = new URL('../data/customer-images.json', import.meta.url)
const homepagePath = new URL('../components/home/HomeRedesign.vue', import.meta.url)
const legacySliderPath = new URL('../components/CustomerSlidingImages.vue', import.meta.url)

const [manifestText, homepage, legacySlider] = await Promise.all([
    readFile(manifestPath, 'utf8'),
    readFile(homepagePath, 'utf8'),
    readFile(legacySliderPath, 'utf8'),
])

const customerImageFiles = JSON.parse(manifestText)
assert.ok(Array.isArray(customerImageFiles), 'Customer image manifest must be an array.')
assert.ok(customerImageFiles.length >= 107, 'Customer image manifest unexpectedly lost images.')

customerImageFiles.forEach((file) => {
    assert.equal(typeof file, 'string', 'Every customer image manifest entry must be a string.')
    assert.match(file, /^[a-zA-Z0-9._-]+\.jpg$/, `Invalid customer image key: ${file}`)
})

assert.equal(
    new Set(customerImageFiles).size,
    customerImageFiles.length,
    'Customer image manifest contains a duplicate key.',
)

for (const requiredFile of ['120.jpg', '121.jpg', '122.jpg']) {
    assert.ok(customerImageFiles.includes(requiredFile), `Customer image manifest is missing ${requiredFile}.`)
}

assert.match(
    homepage,
    /import customerImageFiles from '~\/data\/customer-images\.json'/,
    'Homepage must import the shared customer image manifest.',
)
assert.equal(
    homepage.includes('const customerImageFiles = ['),
    false,
    'Homepage still contains a separate hardcoded customer image list.',
)
assert.match(
    legacySlider,
    /import customerImageFiles from '~\/data\/customer-images\.json'/,
    'Legacy slider must import the shared customer image manifest.',
)
assert.match(
    legacySlider,
    /v-for="image in customerImages"/,
    'Legacy slider must render the shared customer image manifest.',
)
assert.equal(
    /<img\s+src="https:\/\/img\.bedfordfineartgallery\.com\/customer-images\//.test(legacySlider),
    false,
    'Legacy slider still contains hardcoded customer image elements.',
)

function requestImage(file) {
    return new Promise((resolve, reject) => {
        const request = https.request(`${imageHost}${encodeURIComponent(file)}`, { method: 'HEAD' }, (response) => {
            response.resume()
            const contentType = response.headers['content-type'] || ''
            if (response.statusCode !== 200) {
                reject(new Error(`${file} returned HTTP ${response.statusCode}.`))
                return
            }
            if (!contentType.startsWith('image/')) {
                reject(new Error(`${file} returned unexpected content type ${contentType}.`))
                return
            }
            resolve()
        })

        request.setTimeout(10000, () => request.destroy(new Error(`${file} timed out.`)))
        request.on('error', reject)
        request.end()
    })
}

async function verifyRemoteImage(file) {
    let lastError
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await requestImage(file)
            return
        } catch (error) {
            lastError = error
            if (attempt < 3) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 300))
            }
        }
    }
    throw lastError
}

if (process.argv.includes('--remote')) {
    const pending = [...customerImageFiles]
    const workers = Array.from({ length: 8 }, async () => {
        while (pending.length) {
            await verifyRemoteImage(pending.shift())
        }
    })
    await Promise.all(workers)
}

// eslint-disable-next-line no-console
console.log(
    `Customer image verification passed for ${customerImageFiles.length} unique entries${
        process.argv.includes('--remote') ? ' and public objects' : ''
    }.`,
)
