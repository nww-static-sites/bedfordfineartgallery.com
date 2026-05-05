const https = require('https')

const buildHookUrl = process.env.BEDFORD_NETLIFY_BUILD_HOOK_URL
const publishStoreName = process.env.BEDFORD_CMS_PUBLISH_STORE || 'bedford-cms-publish-state'
const publishCooldownMs = Number(process.env.BEDFORD_CMS_PUBLISH_COOLDOWN_MS || 10 * 60 * 1000)
const allowedEmails = (process.env.BEDFORD_CMS_PUBLISH_EMAILS || [
    'andrew.sabourin@seoexperts.com',
    'joanhawk@comcast.net',
    'shawns@webretailgroup.com',
    'support@nittanyweb.com',
    'tech@webretailgroup.com',
].join(','))
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    }
}

function triggerNetlifyBuild() {
    return new Promise((resolve, reject) => {
        if (!buildHookUrl) {
            reject(new Error('Netlify publish hook is not configured.'))
            return
        }

        const request = https.request(buildHookUrl, { method: 'POST' }, (response) => {
            const chunks = []
            response.on('data', (chunk) => chunks.push(chunk))
            response.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8')

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve()
                    return
                }

                reject(new Error(text || `Netlify build hook returned ${response.statusCode}.`))
            })
        })

        request.on('error', reject)
        request.end()
    })
}

async function getPublishStore() {
    const { getStore } = await import('@netlify/blobs')
    const siteID = process.env.BEDFORD_NETLIFY_BLOBS_SITE_ID
    const token = process.env.BEDFORD_NETLIFY_BLOBS_TOKEN

    if (siteID && token) {
        return getStore(publishStoreName, { siteID, token })
    }

    return getStore(publishStoreName)
}

async function getRecentPublish() {
    try {
        const store = await getPublishStore()
        const publish = await store.get('latest', { type: 'json' })
        const startedAt = Number(publish && publish.startedAt)

        if (!Number.isFinite(startedAt) || Date.now() - startedAt >= publishCooldownMs) {
            return null
        }

        return publish
    } catch (error) {
        return null
    }
}

async function savePublishStart(email, startedAt) {
    try {
        const store = await getPublishStore()
        await store.setJSON('latest', {
            email,
            startedAt,
        })
    } catch (error) {
        return undefined
    }
}

async function clearPublishStart() {
    try {
        const store = await getPublishStore()
        await store.delete('latest')
    } catch (error) {
        return undefined
    }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' })
    }

    const user = context.clientContext && context.clientContext.user
    const email = String(user && user.email || '').toLowerCase()

    if (!email) {
        return jsonResponse(401, { error: 'Please log in to the CMS before publishing the site.' })
    }

    if (!allowedEmails.includes(email)) {
        return jsonResponse(403, { error: 'This CMS user is not allowed to publish the site.' })
    }

    try {
        const recentPublish = await getRecentPublish()

        if (recentPublish) {
            return jsonResponse(409, {
                error: 'A publish was already started. Please wait for the current Netlify deploy to finish before publishing again.',
                startedAt: recentPublish.startedAt,
            })
        }

        const startedAt = Date.now()
        await savePublishStart(email, startedAt)
        await triggerNetlifyBuild()

        return jsonResponse(200, {
            message: 'Publish started. Netlify usually takes 7-10 minutes.',
            startedAt,
        })
    } catch (error) {
        await clearPublishStart()
        return jsonResponse(500, { error: error.message })
    }
}
