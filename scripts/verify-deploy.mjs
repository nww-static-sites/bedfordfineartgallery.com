const argumentsByName = new Map()

for (let index = 2; index < process.argv.length; index += 2) {
    argumentsByName.set(process.argv[index], process.argv[index + 1])
}

const baseUrl = String(argumentsByName.get('--base') || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '')
const productionUrl = String(argumentsByName.get('--production-base') || process.env.URL || '').replace(/\/$/, '')
const commitRef = String(argumentsByName.get('--commit-ref') || process.env.COMMIT_REF || '')
const context = String(process.env.CONTEXT || 'manual')
const cacheBuster = Date.now()
const knownDeadProductionPaths = new Set(['/art-lovers-niche-article', '/artist-bio', '/highlight', '/painting'])

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
            '/images/bedford-fine-art-gallery-logo-v3-250.png',
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
    { path: '/admin/', includes: ['identity.netlify.com/v1/netlify-identity-widget.js'] },
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
    await verifySitemapSuperset()
    await verifyProductionIsolation()
    console.log(`Deploy verification passed for ${baseUrl}.`)
} catch (error) {
    console.error(`Deploy verification failed for ${baseUrl}: ${error.message}`)
    process.exit(1)
}
