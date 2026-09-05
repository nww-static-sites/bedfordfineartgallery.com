import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const infrastructureRoot = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(process.env.BEDFORD_PROJECT_ROOT || path.resolve(infrastructureRoot, '..', '..'))
const sourcePath = path.join(projectRoot, 'static', '_redirects')
const outputRoot = path.resolve(process.argv[2] || path.join(infrastructureRoot, 'build'))
const releaseSha = String(process.argv[3] || process.env.BEDFORD_RELEASE_SHA || '')
const routingFormat = Number(process.env.BEDFORD_ROUTING_FORMAT || '1')
const behaviorVersion = 'bedford-edge-v1'
const source = fs.readFileSync(sourcePath, 'utf8')
const routes = []
const shadowedRoutes = []
const skippedRewrites = []

if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
    throw new Error('A 40-character BEDFORD_RELEASE_SHA or third argument is required.')
}
if (![1, 2].includes(routingFormat)) throw new Error('Unsupported routing format.')

function generatedFileFor(routePath) {
    if (routePath === '/') return path.join(projectRoot, 'dist', 'index.html')
    if (routePath.endsWith('/')) return path.join(projectRoot, 'dist', routePath.slice(1), 'index.html')
    const relative = routePath.slice(1)
    const direct = path.join(projectRoot, 'dist', relative)
    if (fs.existsSync(direct)) return direct
    if (!path.extname(relative)) return path.join(projectRoot, 'dist', `${relative}.html`)
    return direct
}

for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const fields = line.split(/\s+/)
    if (fields.length < 2 || fields.length > 3) throw new Error(`Invalid redirect line ${index + 1}: ${rawLine}`)
    const [sourcePathValue, location] = fields
    if (!sourcePathValue.startsWith('/') || sourcePathValue.includes('\\') || /[?#\x00-\x1f]/.test(sourcePathValue) || sourcePathValue.split('/').some(part => part === '..' || part === '.')) {
        throw new Error(`Invalid redirect source on line ${index + 1}`)
    }
    const status = Number(String(fields[2] || '301').replace('!', ''))
    const forced = String(fields[2] || '').endsWith('!')
    if (status === 200) {
        skippedRewrites.push({ source: sourcePathValue, location, status, line: index + 1 })
        continue
    }
    if (status !== 301) throw new Error(`Unsupported redirect status on line ${index + 1}: ${status}`)
    if (sourcePathValue.includes('*')) throw new Error(`Unexpected redirect wildcard on line ${index + 1}`)
    const route = { source: sourcePathValue, location, status, forced, line: index + 1 }
    if (!forced && fs.existsSync(generatedFileFor(sourcePathValue))) {
        shadowedRoutes.push(route)
        continue
    }
    const key = `r:${releaseSha}:${sourcePathValue}`
    const value = JSON.stringify({ status, location })
    if (Buffer.byteLength(key) > 512) throw new Error(`KVS key is too long on line ${index + 1}`)
    if (Buffer.byteLength(value) > 1024) throw new Error(`KVS value is too long on line ${index + 1}`)
    routes.push({ key, value, ...route })
}

const unique = new Set()
for (const route of routes) {
    if (unique.has(route.key)) throw new Error(`Duplicate redirect source: ${route.source}`)
    unique.add(route.key)
}

// Preserve the exact legacy digest for existing jobs and immutable receipts.
routes.sort((left, right) => left.key.localeCompare(right.key))
let digest = crypto.createHash('sha256').update(routes.map(({ key, value }) => `${key}\0${value}\n`).join('')).digest('hex')
let records = [
    { key: `@config:${releaseSha}`, value: digest },
    ...routes.map(({ key, value }) => ({ key, value })),
]
let routeSetHash
if (routingFormat === 2) {
    const rules = routes.map(({ source, location, status }) => ({ location, source, status }))
        .sort((a, b) => Buffer.compare(Buffer.from(a.source), Buffer.from(b.source)))
    const canonical = JSON.stringify({ behaviorVersion, rules, schemaVersion: 2 })
    routeSetHash = crypto.createHash('sha256').update(canonical).digest('hex')
    digest = routeSetHash
    records = rules.map(({ source, location, status }) => ({
        key: `r2:${routeSetHash}:${source}`,
        value: JSON.stringify({ location, status }),
    }))
    for (const { key, value } of records) {
        if (Buffer.byteLength(key) > 512 || Buffer.byteLength(value) > 1024) {
            throw new Error('Shared routing record exceeds the storage limit.')
        }
    }
}

fs.mkdirSync(outputRoot, { recursive: true })
fs.writeFileSync(path.join(outputRoot, 'routing-kvs.json'), `${JSON.stringify({ schemaVersion: routingFormat, releaseSha, digest, ...(routingFormat === 2 ? { routeSetHash, behaviorVersion } : {}), records }, null, 2)}\n`)
fs.writeFileSync(path.join(outputRoot, 'routing-fixtures.json'), `${JSON.stringify({ schemaVersion: 1, releaseSha, digest, routes, shadowedRoutes, skippedRewrites }, null, 2)}\n`)
console.log(`Generated ${routes.length} effective redirects, ${shadowedRoutes.length} file-shadowed redirects, ${skippedRewrites.length} handled rewrites, digest ${digest}.`)
