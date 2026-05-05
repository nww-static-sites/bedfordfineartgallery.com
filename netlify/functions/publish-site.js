const https = require('https')

const siteId = process.env.BEDFORD_NETLIFY_SITE_ID || '50e4dd76-2749-40f0-bad3-310eb125bb8a'
const buildHookUrl = process.env.BEDFORD_NETLIFY_BUILD_HOOK_URL
const netlifyToken = process.env.BEDFORD_NETLIFY_BUILD_TOKEN || process.env.BEDFORD_NETLIFY_BLOBS_TOKEN
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
        if (buildHookUrl) {
            const request = https.request(buildHookUrl, { method: 'POST' }, (response) => {
                const chunks = []
                response.on('data', (chunk) => chunks.push(chunk))
                response.on('end', () => {
                    const text = Buffer.concat(chunks).toString('utf8')

                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve({ hook: true, body: text })
                        return
                    }

                    reject(new Error(text || `Netlify build hook returned ${response.statusCode}.`))
                })
            })

            request.on('error', reject)
            request.end()
            return
        }

        if (!netlifyToken) {
            reject(new Error('Netlify publish hook or token is not configured.'))
            return
        }

        const request = https.request(
            {
                method: 'POST',
                hostname: 'api.netlify.com',
                path: `/api/v1/sites/${siteId}/builds`,
                headers: {
                    Authorization: `Bearer ${netlifyToken}`,
                    'Content-Type': 'application/json',
                },
            },
            (response) => {
                const chunks = []
                response.on('data', (chunk) => chunks.push(chunk))
                response.on('end', () => {
                    const text = Buffer.concat(chunks).toString('utf8')
                    let body = {}

                    if (text) {
                        try {
                            body = JSON.parse(text)
                        } catch (error) {
                            body = { error: text }
                        }
                    }

                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(body)
                        return
                    }

                    reject(new Error(body.message || body.error || `Netlify API returned ${response.statusCode}.`))
                })
            }
        )

        request.on('error', reject)
        request.end('{}')
    })
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
        const build = await triggerNetlifyBuild()

        return jsonResponse(200, {
            buildId: build.id,
            deployId: build.deploy_id,
            message: 'Publish started. Netlify usually takes 7-10 minutes.',
        })
    } catch (error) {
        return jsonResponse(500, { error: error.message })
    }
}
