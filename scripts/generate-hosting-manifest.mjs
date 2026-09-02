import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const artifactRoot = path.join(projectRoot, 'dist')
const outputPath = path.resolve(process.argv[2] || path.join(projectRoot, 'dist-hosting-manifest.json'))
const sourceGitSha = String(process.env.BEDFORD_SOURCE_SHA || '')
const releaseGitSha = String(process.env.BEDFORD_RELEASE_SHA || process.env.COMMIT_REF || '')
const jobId = String(process.env.BEDFORD_JOB_ID || '')

function filesIn(folder) {
    return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(folder, entry.name)
        return entry.isDirectory() ? filesIn(fullPath) : [fullPath]
    })
}

function contentType(relative) {
    const extension = path.extname(relative).toLowerCase()
    return ({
        '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
        '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
        '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
        '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.gz': 'application/gzip',
    })[extension] || 'application/octet-stream'
}

function cacheControl(relative) {
    if (relative.startsWith('_nuxt/static/')) return 'public,max-age=0,must-revalidate'
    if (relative.startsWith('_nuxt/')) return 'public,max-age=31536000,immutable'
    if (/^data\/ipad-paintings-[0-9a-f]+\.json$/.test(relative)) return 'public,max-age=31536000,immutable'
    if (relative === 'data/ipad-paintings-manifest.json' || relative === 'data/testimonials.json') return 'public,max-age=0,s-maxage=60,must-revalidate'
    if (relative.startsWith('admin/')) return 'no-store,max-age=0'
    return 'public,max-age=0,s-maxage=31536000,must-revalidate'
}

if (!fs.existsSync(artifactRoot)) throw new Error('dist does not exist')
const files = filesIn(artifactRoot).sort()
const records = files.map((file) => {
    const relative = path.relative(artifactRoot, file).split(path.sep).join('/')
    const body = fs.readFileSync(file)
    return {
        path: relative,
        bytes: body.length,
        sha256: crypto.createHash('sha256').update(body).digest('hex'),
        contentType: contentType(relative),
        cacheControl: cacheControl(relative),
    }
})
const canonical = records.map((record) => `${record.path}\0${record.bytes}\0${record.sha256}\0${record.contentType}\0${record.cacheControl}\n`).join('')
const document = {
    schemaVersion: 1,
    sourceGitSha,
    releaseGitSha,
    jobId,
    generatedAt: new Date().toISOString(),
    fileCount: records.length,
    byteCount: records.reduce((total, record) => total + record.bytes, 0),
    manifestDigest: crypto.createHash('sha256').update(canonical).digest('hex'),
    files: records,
}
fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`)
console.log(`hosting_manifest=pass files=${document.fileCount} bytes=${document.byteCount} digest=${document.manifestDigest}`)
