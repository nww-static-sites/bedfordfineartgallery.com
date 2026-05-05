const https = require('https')

const buildHookUrl = process.env.BEDFORD_NETLIFY_BUILD_HOOK_URL
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
        await triggerNetlifyBuild()

        return jsonResponse(200, {
            message: 'Publish started. Netlify usually takes 7-10 minutes.',
        })
    } catch (error) {
        return jsonResponse(500, { error: error.message })
    }
}
