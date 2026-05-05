const https = require('https')

const siteId = process.env.BEDFORD_NETLIFY_SITE_ID || '50e4dd76-2749-40f0-bad3-310eb125bb8a'
const buildHookUrl = process.env.BEDFORD_NETLIFY_BUILD_HOOK_URL
const netlifyStatusToken = process.env.BEDFORD_NETLIFY_STATUS_TOKEN || process.env.BEDFORD_NETLIFY_BLOBS_TOKEN
const githubRepo = process.env.BEDFORD_GITHUB_REPO || 'nww-static-sites/bedfordfineartgallery.com'
const githubBranch = process.env.BEDFORD_GITHUB_BRANCH || 'main'
const publishStoreName = process.env.BEDFORD_CMS_PUBLISH_STORE || 'bedford-cms-publish-state'
const publishCooldownMs = Number(process.env.BEDFORD_CMS_PUBLISH_COOLDOWN_MS || 2 * 60 * 1000)
const activeDeployStates = new Set(['new', 'building', 'processing', 'uploading', 'enqueued', 'preparing', 'prepared'])
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
            'cache-control': 'no-store',
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    }
}

function requestJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        const request = https.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (response) => {
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

                reject(new Error(body.message || body.error || `Request returned ${response.statusCode}.`))
            })
        })

        request.on('error', reject)

        if (options.body) {
            request.write(options.body)
        }

        request.end()
    })
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

async function getGitHead() {
    const commit = await requestJson(`https://api.github.com/repos/${githubRepo}/commits/${githubBranch}`, {
        headers: {
            accept: 'application/vnd.github+json',
            'user-agent': 'bedford-cms-publish-status',
        },
    })

    return {
        sha: commit.sha,
        shortSha: String(commit.sha || '').slice(0, 8),
        message: commit.commit && commit.commit.message,
        date: commit.commit && commit.commit.committer && commit.commit.committer.date,
    }
}

async function getNetlifyDeploys() {
    if (!netlifyStatusToken) {
        throw new Error('Netlify status token is not configured.')
    }

    return requestJson(`https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=25`, {
        headers: {
            authorization: `Bearer ${netlifyStatusToken}`,
        },
    })
}

function isProductionDeploy(deploy) {
    return deploy && deploy.context === 'production' && deploy.branch === githubBranch
}

function isActiveDeploy(deploy) {
    return isProductionDeploy(deploy) && activeDeployStates.has(deploy.state)
}

function isReadyDeploy(deploy) {
    return isProductionDeploy(deploy) && deploy.state === 'ready' && deploy.commit_ref
}

async function getAheadBy(deployedCommit, gitCommit) {
    if (!deployedCommit || !gitCommit || deployedCommit === gitCommit) {
        return 0
    }

    try {
        const comparison = await requestJson(`https://api.github.com/repos/${githubRepo}/compare/${deployedCommit}...${gitCommit}`, {
            headers: {
                accept: 'application/vnd.github+json',
                'user-agent': 'bedford-cms-publish-status',
            },
        })

        return Number(comparison.ahead_by) || 0
    } catch (error) {
        return null
    }
}

async function getPublishStatus() {
    const [gitHead, deploys, recentPublish] = await Promise.all([
        getGitHead(),
        getNetlifyDeploys(),
        getRecentPublish(),
    ])
    const activeDeploy = deploys.find(isActiveDeploy)
    const latestReadyDeploy = deploys.find(isReadyDeploy)
    const deployedCommit = latestReadyDeploy && latestReadyDeploy.commit_ref

    if (activeDeploy) {
        return {
            state: 'publishing',
            canPublish: false,
            message: 'Publishing saved changes now. Netlify usually takes 7-10 minutes.',
            gitCommit: gitHead.sha,
            gitShortCommit: gitHead.shortSha,
            deployedCommit,
            deployedShortCommit: String(deployedCommit || '').slice(0, 8),
            activeDeployId: activeDeploy.id,
            activeDeployState: activeDeploy.state,
            activeDeployCommit: activeDeploy.commit_ref,
            activeDeployShortCommit: String(activeDeploy.commit_ref || '').slice(0, 8),
        }
    }

    if (recentPublish) {
        return {
            state: 'publishing',
            canPublish: false,
            message: 'Publish was just started. Waiting for Netlify to report the deploy.',
            gitCommit: gitHead.sha,
            gitShortCommit: gitHead.shortSha,
            deployedCommit,
            deployedShortCommit: String(deployedCommit || '').slice(0, 8),
            startedAt: recentPublish.startedAt,
        }
    }

    if (deployedCommit === gitHead.sha) {
        return {
            state: 'current',
            canPublish: false,
            message: 'Nothing to publish. Live site is current.',
            gitCommit: gitHead.sha,
            gitShortCommit: gitHead.shortSha,
            deployedCommit,
            deployedShortCommit: String(deployedCommit || '').slice(0, 8),
            aheadBy: 0,
        }
    }

    const aheadBy = await getAheadBy(deployedCommit, gitHead.sha)
    const changeText = aheadBy === 1 ? '1 saved change' : `${aheadBy || 'Saved'} changes`

    return {
        state: 'unpublished',
        canPublish: true,
        message: `${changeText} waiting to publish.`,
        gitCommit: gitHead.sha,
        gitShortCommit: gitHead.shortSha,
        deployedCommit,
        deployedShortCommit: String(deployedCommit || '').slice(0, 8),
        aheadBy,
    }
}

function getAuthorizedEmail(context) {
    const user = context.clientContext && context.clientContext.user
    const email = String(user && user.email || '').toLowerCase()

    if (!email) {
        return { error: jsonResponse(401, { error: 'Please log in to the CMS before publishing the site.' }) }
    }

    if (!allowedEmails.includes(email)) {
        return { error: jsonResponse(403, { error: 'This CMS user is not allowed to publish the site.' }) }
    }

    return { email }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' })
    }

    const authorization = getAuthorizedEmail(context)

    if (authorization.error) {
        return authorization.error
    }

    try {
        const status = await getPublishStatus()

        if (event.httpMethod === 'GET') {
            return jsonResponse(200, status)
        }

        if (status.state === 'publishing') {
            return jsonResponse(409, {
                ...status,
                error: 'A publish is already in progress.',
            })
        }

        if (!status.canPublish) {
            return jsonResponse(409, {
                ...status,
                error: 'There is nothing new to publish.',
            })
        }

        const recentPublish = await getRecentPublish()

        if (recentPublish) {
            return jsonResponse(409, {
                state: 'publishing',
                canPublish: false,
                error: 'A publish was already started. Please wait for Netlify to report the deploy.',
                startedAt: recentPublish.startedAt,
            })
        }

        const startedAt = Date.now()
        await savePublishStart(authorization.email, startedAt)
        await triggerNetlifyBuild()

        return jsonResponse(200, {
            state: 'publishing',
            canPublish: false,
            message: 'Publish started. Netlify usually takes 7-10 minutes.',
            startedAt,
        })
    } catch (error) {
        if (event.httpMethod === 'POST') {
            await clearPublishStart()
        }

        return jsonResponse(500, { error: error.message })
    }
}
