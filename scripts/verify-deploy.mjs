const argumentsByName = new Map()

for (let index = 2; index < process.argv.length; index += 2) {
    argumentsByName.set(process.argv[index], process.argv[index + 1])
}

const baseUrl = String(argumentsByName.get('--base') || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '')
const productionUrl = String(argumentsByName.get('--production-base') || process.env.URL || '').replace(/\/$/, '')
const commitRef = String(argumentsByName.get('--commit-ref') || process.env.COMMIT_REF || '')
const context = String(process.env.CONTEXT || 'manual')
const cacheBuster = Date.now()
const knownDeadProductionPaths = new Set([
    '/art-lovers-niche-article',
    '/artist-bio',
    '/highlight',
    '/painting',
    '/index-old-april24',
    '/customer-images-loop.html',
    '/Artists-nav.html',
    '/artists-search_filter.html',
    '/testimonials_only.html',
])

if (!baseUrl) {
    console.error('Deploy verification requires --base or DEPLOY_PRIME_URL.')
    process.exit(1)
}

const checks = [
    {
        path: '/',
        includes: [
            'cx_site-header',
            'cx_site-footer',
            'https://img.bedfordfineartgallery.com/images/bedford-fine-art-gallery-logo-v3-250.png',
            'https://img.bedfordfineartgallery.com/images/bedford-shipping-options-voiceover-2026-06-21.mp3',
        ],
        excludes: ['identity.netlify.com/v1/netlify-identity-widget.js'],
        verifyDeployRef: true,
    },
    {
        path: '/Artists--Bios.html',
        includes: ['cx_site-header', 'cx_site-footer'],
        verifyDeployRef: true,
    },
    { path: '/Artists.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/Directions.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/faq.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/privacy.htm', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/art_lovers_niche.htm', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/notable_sales.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/landscape_artwork.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/victorian_art.html', includes: ['cx_site-header', 'cx_site-footer'] },
    { path: '/ipad/', includes: ['Bedford Fine Art Gallery'] },
    { path: '/ipad/a_a_glendening_sheep_wagon_path.html', includes: ['Bedford Fine Art Gallery'] },
    { path: '/ipad/19th_century_italian_or_continental_school_still_life', includes: ['Bedford Fine Art Gallery'] },
    {
        path: '/admin/',
        includes: ['<h1>Unavailable</h1>', 'This login location is no longer available.'],
        excludes: [
            'Netlify',
            'Nittany Web Works',
            'Extranet',
            'content editor',
            'tech@nittanyweb.com',
            'identity.netlify.com/v1/netlify-identity-widget.js',
            'unpkg.com/netlify-cms',
            '/admin/bedford-s3-media-library.js',
            '/admin/bedford-publish-site.js',
        ],
    },
    {
        path: '/george_t_hetzel_artist.html',
        includes: ['George T. Hetzel', 'Deputy Recorder of Allegheny County'],
    },
    {
        path: '/george_t_hetzel_burnished_forest_stream.html',
        includes: ['George T. Hetzel', 'Burnished Forest Stream'],
    },
    {
        path: '/george_t_hetzel_for_later.html',
        includes: ['George T. Hetzel'],
    },
]

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchWithRetry(url, attempts = 5) {
    let lastError

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: {
                    'cache-control': 'no-cache',
                    'user-agent': 'Bedford deploy smoke verifier',
                },
            })

            if (response.ok) {
                return response
            }

            lastError = new Error(`${response.status} ${response.statusText}`)
        } catch (error) {
            lastError = error
        }

        if (attempt < attempts) {
            await sleep(attempt * 1500)
        }
    }

    throw lastError
}

function deployRefIsPresent(html) {
    return html.includes('name="cx-deploy-ref"') && html.includes(`content="${commitRef}"`)
}

async function verifyPage(check) {
    const separator = check.path.includes('?') ? '&' : '?'
    const response = await fetchWithRetry(`${baseUrl}${check.path}${separator}cx_smoke=${cacheBuster}`)
    const html = await response.text()

    for (const expected of check.includes || []) {
        if (!html.includes(expected)) {
            throw new Error(`${check.path} is missing expected content: ${expected}`)
        }
    }

    for (const forbidden of check.excludes || []) {
        if (html.includes(forbidden)) {
            throw new Error(`${check.path} contains forbidden content: ${forbidden}`)
        }
    }

    if (check.verifyDeployRef && commitRef && !deployRefIsPresent(html)) {
        throw new Error(`${check.path} does not identify deployed commit ${commitRef}`)
    }

    console.log(`PASS ${check.path}`)
}

async function verifyRemovedEndpoint(path, method = 'GET') {
    const response = await fetch(`${baseUrl}${path}?cx_smoke=${cacheBuster}`, {
        method,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'user-agent': 'Bedford deploy smoke verifier',
        },
        body: method === 'POST' ? '{}' : undefined,
    })
    if (response.status !== 404) {
        throw new Error(`${path} should be absent with HTTP 404; received ${response.status}.`)
    }

    console.log(`PASS ${path} removed (${response.status})`)
}

async function verifyRedirect(path, destination) {
    const response = await fetch(`${baseUrl}${path}?cx_smoke=${cacheBuster}`, {
        headers: {
            'cache-control': 'no-cache',
            'user-agent': 'Bedford deploy smoke verifier',
        },
        redirect: 'manual',
    })
    const location = response.headers.get('location')
    const actualDestination = location ? new URL(location, baseUrl).pathname : ''

    if (response.status !== 301 || actualDestination !== destination) {
        throw new Error(`${path} should redirect permanently to ${destination}; received ${response.status} ${location}.`)
    }

    console.log(`PASS ${path} redirects to ${destination} (${response.status})`)
}

async function verifyIpadData() {
    const manifestResponse = await fetchWithRetry(`${baseUrl}/data/ipad-paintings-manifest.json?cx_smoke=${cacheBuster}`)
    const manifest = await manifestResponse.json()
    const dataResponse = await fetchWithRetry(`${baseUrl}${manifest.file}`)
    const data = await dataResponse.json()

    if (!Array.isArray(data.paintings) || data.paintings.length !== manifest.paintingCount) {
        throw new Error('Shared iPad data does not match its manifest.')
    }

    const knownPainting = data.paintings.find(
        (painting) => painting.ipadPath === '/ipad/a_a_glendening_sheep_wagon_path.html'
    )
    if (!knownPainting || knownPainting.title !== 'Sheep by Wagon Path') {
        throw new Error('Shared iPad data is missing the known kiosk painting check.')
    }

    console.log(`PASS shared iPad data (${data.paintings.length} paintings)`)
}

async function verifyRemovedAdminAsset(path) {
    const response = await fetch(`${baseUrl}${path}?cx_smoke=${cacheBuster}`, {
        headers: {
            'cache-control': 'no-cache',
            'user-agent': 'Bedford deploy smoke verifier',
        },
        redirect: 'manual',
    })

    if (response.status !== 404) {
        throw new Error(`${path} should no longer be public; received ${response.status}.`)
    }

    console.log(`PASS ${path} removed (${response.status})`)
}

async function verifyMovedAsset(path, expectedDestination, expectedContentType) {
    const response = await fetch(`${baseUrl}${path}?cx_smoke=${cacheBuster}`, {
        headers: {
            'cache-control': 'no-cache',
            range: 'bytes=0-99',
            'user-agent': 'Bedford deploy smoke verifier',
        },
    })

    if (response.url.split('?')[0] !== expectedDestination || !response.ok) {
        throw new Error(`${path} did not resolve to its verified asset-host destination.`)
    }

    if (!String(response.headers.get('content-type') || '').startsWith(expectedContentType)) {
        throw new Error(`${path} returned an unexpected content type: ${response.headers.get('content-type')}`)
    }

    console.log(`PASS ${path} moved to asset host (${response.status})`)
}

function sitemapPaths(xml) {
    return new Set(
        [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
            const value = match[1].replaceAll('&amp;', '&')
            return new URL(value).pathname
        })
    )
}

async function verifySitemapSuperset() {
    if (!productionUrl || productionUrl === baseUrl || context === 'production') {
        return
    }

    const [previewResponse, productionResponse] = await Promise.all([
        fetchWithRetry(`${baseUrl}/sitemap.xml?cx_smoke=${cacheBuster}`),
        fetchWithRetry(`${productionUrl}/sitemap.xml?cx_smoke=${cacheBuster}`),
    ])
    const previewPaths = sitemapPaths(await previewResponse.text())
    const productionPaths = sitemapPaths(await productionResponse.text())
    const missingPaths = [...productionPaths].filter((route) => !previewPaths.has(route)).sort()
    const unexpectedMissingPaths = missingPaths.filter((route) => !knownDeadProductionPaths.has(route))

    if (unexpectedMissingPaths.length > 0) {
        throw new Error(
            `Preview sitemap dropped ${unexpectedMissingPaths.length} production route(s): ${unexpectedMissingPaths.join(', ')}`
        )
    }

    const removedDeadPaths = missingPaths.filter((route) => knownDeadProductionPaths.has(route))

    for (const route of removedDeadPaths) {
        const response = await fetch(`${productionUrl}${route}?cx_smoke=${cacheBuster}`, {
            headers: {
                'cache-control': 'no-cache',
                'user-agent': 'Bedford deploy smoke verifier',
            },
        })

        if (response.status !== 404) {
            throw new Error(`Sitemap cleanup allowlist is stale: production ${route} returned ${response.status}`)
        }
    }

    console.log(`PASS sitemap route preservation (${productionPaths.size} production routes retained)`)

    if (removedDeadPaths.length > 0) {
        console.log(`PASS sitemap dead-route cleanup (${removedDeadPaths.join(', ')})`)
    }
}

async function verifyProductionIsolation() {
    if (!productionUrl || productionUrl === baseUrl || !commitRef || context === 'production') {
        return
    }

    const response = await fetchWithRetry(`${productionUrl}/?cx_smoke=${cacheBuster}`)
    const productionHome = await response.text()

    if (productionHome.includes(`content="${commitRef}"`)) {
        throw new Error(`Production unexpectedly contains preview commit ${commitRef}`)
    }

    console.log('PASS production isolation')
}

try {
    for (const check of checks) {
        await verifyPage(check)
    }
    await verifyIpadData()
    await verifyRemovedEndpoint('/.netlify/functions/s3-upload', 'POST')
    await verifyRemovedEndpoint('/.netlify/functions/publish-site')
    await verifyRedirect('/index-old-april24', '/')
    await verifyRedirect('/index-old-april24.html', '/')
    await verifyRedirect('/customer-images-loop.html', '/')
    await verifyRedirect('/Artists-nav.html', '/Artists.html')
    await verifyRedirect('/artists-search_filter.html', '/Artists.html')
    await verifyRedirect('/testimonials_only.html', '/testimonials.htm')
    await verifyRemovedAdminAsset('/admin/config.yml')
    await verifyRemovedAdminAsset('/admin/bedford-s3-media-library.js')
    await verifyRemovedAdminAsset('/admin/bedford-publish-site.js')
    await verifyMovedAsset(
        '/images/bedford-shipping-options-voiceover-2026-06-21.mp3',
        'https://img.bedfordfineartgallery.com/images/bedford-shipping-options-voiceover-2026-06-21.mp3',
        'audio/mpeg'
    )
    await verifyMovedAsset(
        '/images/bedford-fine-art-gallery-logo-v3-250.png',
        'https://img.bedfordfineartgallery.com/images/bedford-fine-art-gallery-logo-v3-250.png',
        'image/png'
    )
    await verifySitemapSuperset()
    await verifyProductionIsolation()
    console.log(`Deploy verification passed for ${baseUrl}.`)
} catch (error) {
    console.error(`Deploy verification failed for ${baseUrl}: ${error.message}`)
    process.exit(1)
}
