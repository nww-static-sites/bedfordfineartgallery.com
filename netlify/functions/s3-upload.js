const crypto = require('crypto')
const https = require('https')

const bucket = process.env.BEDFORD_S3_BUCKET || 'img.bedfordfineartgallery.com'
const region = process.env.BEDFORD_S3_REGION || 'us-east-2'
const imageHost = (process.env.BEDFORD_IMAGE_HOST || 'https://img.bedfordfineartgallery.com').replace(/\/+$/, '')
const uploadPrefix = (process.env.BEDFORD_UPLOAD_PREFIX || 'cms-uploads/').replace(/^\/+/, '')
const maxBytes = Number(process.env.BEDFORD_UPLOAD_MAX_BYTES || 8 * 1024 * 1024)
const chunkStoreName = process.env.BEDFORD_UPLOAD_CHUNK_STORE || 'bedford-cms-upload-chunks'

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.BEDFORD_CMS_ORIGIN || 'https://www.bedfordfineartgallery.com',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            ...corsHeaders,
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    }
}

function hmac(key, value) {
    return crypto.createHmac('sha256', key).update(value).digest()
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex')
}

function amzDate(date = new Date()) {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function dateStamp(value) {
    return value.slice(0, 8)
}

function signingKey(secretAccessKey, stamp) {
    const kDate = hmac(`AWS4${secretAccessKey}`, stamp)
    const kRegion = hmac(kDate, region)
    const kService = hmac(kRegion, 's3')
    return hmac(kService, 'aws4_request')
}

function encodeKey(key) {
    return key
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')
}

function cleanFilename(filename) {
    const fallback = `upload-${Date.now()}.jpg`
    const original = (filename || fallback).split(/[\\/]/).pop() || fallback
    const ext = original.includes('.') ? original.split('.').pop().toLowerCase() : 'jpg'
    const name = original
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'upload'

    return `${name}.${ext}`
}

function validateImageMetadata({ contentType, filename, size }) {
    if (typeof size === 'number' && size > maxBytes) {
        throw new Error(`Image is too large for CMS upload. Maximum is ${Math.floor(maxBytes / 1024 / 1024)} MB.`)
    }

    if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(contentType || '')) {
        throw new Error('Only JPG, PNG, GIF, and WebP images can be uploaded.')
    }

    if (!/\.(jpe?g|png|gif|webp)$/i.test(filename || '')) {
        throw new Error('Image filename must end in jpg, jpeg, png, gif, or webp.')
    }
}

function validateImage({ body, contentType, filename }) {
    if (!body || !Buffer.isBuffer(body) || body.length === 0) {
        throw new Error('No image file was received.')
    }

    validateImageMetadata({ body, contentType, filename, size: body.length })
}

function createObjectKey(filename) {
    const now = new Date()
    const datePath = [
        now.getUTCFullYear(),
        String(now.getUTCMonth() + 1).padStart(2, '0'),
    ].join('/')
    const random = crypto.randomBytes(4).toString('hex')

    return `${uploadPrefix}${datePath}/${Date.now()}-${random}-${filename}`
}

async function getChunkStore() {
    const { getStore } = await import('@netlify/blobs')
    const siteID = process.env.BEDFORD_NETLIFY_BLOBS_SITE_ID
    const token = process.env.BEDFORD_NETLIFY_BLOBS_TOKEN

    if (siteID && token) {
        return getStore(chunkStoreName, { siteID, token })
    }

    return getStore(chunkStoreName)
}

function parseChunkIndex(value) {
    const index = Number(value)

    if (!Number.isInteger(index) || index < 0) {
        throw new Error('Invalid upload chunk index.')
    }

    return index
}

function parseTotalChunks(value) {
    const total = Number(value)

    if (!Number.isInteger(total) || total < 1 || total > 30) {
        throw new Error('Invalid upload chunk count.')
    }

    return total
}

function parseUploadId(value) {
    const uploadId = String(value || '')

    if (!/^[a-z0-9-]{12,80}$/i.test(uploadId)) {
        throw new Error('Invalid upload session.')
    }

    return uploadId
}

function chunkKey(uploadId, index) {
    return `${uploadId}/part-${String(index).padStart(3, '0')}`
}

async function storeChunk(payload) {
    const filename = cleanFilename(payload.filename)
    const contentType = payload.contentType || 'application/octet-stream'
    const size = Number(payload.size)
    const uploadId = parseUploadId(payload.uploadId)
    const index = parseChunkIndex(payload.index)
    const total = parseTotalChunks(payload.total)
    const body = Buffer.from(payload.base64 || '', 'base64')

    validateImageMetadata({ contentType, filename, size })

    if (!body.length) {
        throw new Error('No image chunk was received.')
    }

    const store = await getChunkStore()
    await store.set(chunkKey(uploadId, index), body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength), {
        metadata: {
            contentType,
            createdAt: Date.now(),
            filename,
            index,
            size,
            total,
        },
    })

    return jsonResponse(200, {
        index,
        received: true,
    })
}

async function readChunk(store, uploadId, index) {
    const value = await store.get(chunkKey(uploadId, index), { type: 'arrayBuffer' })

    if (value === null) {
        throw new Error(`Upload chunk ${index + 1} is missing. Please choose the image again.`)
    }

    return Buffer.from(value)
}

async function deleteChunks(store, uploadId, total) {
    await Promise.all(
        Array.from({ length: total }, (_, index) =>
            store.delete(chunkKey(uploadId, index)).catch(() => undefined)
        )
    )
}

async function completeChunkedUpload(payload) {
    const filename = cleanFilename(payload.filename)
    const contentType = payload.contentType || 'application/octet-stream'
    const size = Number(payload.size)
    const uploadId = parseUploadId(payload.uploadId)
    const total = parseTotalChunks(payload.total)

    validateImageMetadata({ contentType, filename, size })

    const store = await getChunkStore()
    const chunks = []

    for (let index = 0; index < total; index += 1) {
        chunks.push(await readChunk(store, uploadId, index))
    }

    const body = Buffer.concat(chunks)
    validateImage({ body, contentType, filename })

    if (Number.isFinite(size) && body.length !== size) {
        throw new Error('Uploaded image chunks did not match the selected file size. Please choose the image again.')
    }

    const key = createObjectKey(filename)
    await putObject({ key, body, contentType })
    await deleteChunks(store, uploadId, total)

    return jsonResponse(200, {
        key,
        url: `${imageHost}/${key}`,
    })
}

function putObject({ key, body, contentType }) {
    return new Promise((resolve, reject) => {
        const accessKeyId = process.env.BEDFORD_AWS_ACCESS_KEY_ID
        const secretAccessKey = process.env.BEDFORD_AWS_SECRET_ACCESS_KEY
        const sessionToken = process.env.BEDFORD_AWS_SESSION_TOKEN

        if (!accessKeyId || !secretAccessKey) {
            reject(new Error('AWS credentials are not configured for the CMS upload function.'))
            return
        }

        const now = amzDate()
        const stamp = dateStamp(now)
        const host = `s3.${region}.amazonaws.com`
        const canonicalUri = `/${bucket}/${encodeKey(key)}`
        const payloadHash = sha256(body)
        const headers = {
            'cache-control': 'public, max-age=31536000, immutable',
            'content-type': contentType,
            host,
            'x-amz-content-sha256': payloadHash,
            'x-amz-date': now,
        }

        if (sessionToken) {
            headers['x-amz-security-token'] = sessionToken
        }

        const signedHeaders = Object.keys(headers).sort().join(';')
        const canonicalHeaders = Object.keys(headers)
            .sort()
            .map((name) => `${name}:${headers[name]}\n`)
            .join('')
        const canonicalRequest = [
            'PUT',
            canonicalUri,
            '',
            canonicalHeaders,
            signedHeaders,
            payloadHash,
        ].join('\n')
        const credentialScope = `${stamp}/${region}/s3/aws4_request`
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            now,
            credentialScope,
            sha256(canonicalRequest),
        ].join('\n')
        const signature = crypto
            .createHmac('sha256', signingKey(secretAccessKey, stamp))
            .update(stringToSign)
            .digest('hex')

        const requestHeaders = {
            'Cache-Control': headers['cache-control'],
            'Content-Length': body.length,
            'Content-Type': headers['content-type'],
            Host: host,
            'X-Amz-Content-Sha256': headers['x-amz-content-sha256'],
            'X-Amz-Date': headers['x-amz-date'],
            Authorization:
                `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
                `SignedHeaders=${signedHeaders}, Signature=${signature}`,
        }

        if (sessionToken) {
            requestHeaders['X-Amz-Security-Token'] = sessionToken
        }

        const request = https.request(
            {
                method: 'PUT',
                hostname: host,
                path: canonicalUri,
                headers: requestHeaders,
            },
            (response) => {
                const chunks = []
                response.on('data', (chunk) => chunks.push(chunk))
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve()
                        return
                    }

                    reject(new Error(`S3 upload failed with status ${response.statusCode}: ${Buffer.concat(chunks).toString('utf8')}`))
                })
            }
        )

        request.on('error', reject)
        request.end(body)
    })
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' }
    }

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' })
    }

    try {
        const payload = JSON.parse(event.body || '{}')
        if (payload.action === 'chunk') {
            return await storeChunk(payload)
        }

        if (payload.action === 'complete') {
            return await completeChunkedUpload(payload)
        }

        const filename = cleanFilename(payload.filename)
        const contentType = payload.contentType || 'application/octet-stream'
        const body = Buffer.from(payload.base64 || '', 'base64')

        validateImage({ body, contentType, filename })

        const key = createObjectKey(filename)
        await putObject({ key, body, contentType })

        return jsonResponse(200, {
            key,
            url: `${imageHost}/${key}`,
        })
    } catch (error) {
        return jsonResponse(400, {
            error: error.message,
        })
    }
}
