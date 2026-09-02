import fs from 'node:fs'
import path from 'node:path'

const fixturePath = path.resolve(process.argv[2] || 'infrastructure/aws-hosting/build/routing-fixtures.json')
const outputPath = path.resolve(process.argv[3] || 'infrastructure/aws-hosting/build/live-redirect-baseline.json')
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
const base = 'https://www.bedfordfineartgallery.com'
const pending = [
    ...fixture.routes.map((route) => ({ ...route, expectedStatus: route.status })),
    ...(fixture.shadowedRoutes || []).map((route) => ({ ...route, expectedStatus: 200 })),
]
const results = []

async function worker() {
    while (pending.length) {
        const route = pending.shift()
        const response = await fetch(`${base}${route.source}?provider_exit_baseline=1`, {
            redirect: 'manual',
            headers: { 'cache-control': 'no-cache', 'user-agent': 'Bedford provider-exit redirect baseline' },
        })
        results.push({
            source: route.source,
            configuredStatus: route.status,
            configuredLocation: route.location,
            expectedStatus: route.expectedStatus,
            actualStatus: response.status,
            actualLocation: response.headers.get('location') || '',
        })
    }
}

await Promise.all(Array.from({ length: 8 }, worker))
results.sort((left, right) => left.source.localeCompare(right.source))
const failures = results.filter((result) => {
    if (result.actualStatus !== result.expectedStatus) return true
    if (result.expectedStatus === 200) return Boolean(result.actualLocation)
    const actual = new URL(result.actualLocation, base)
    const expected = new URL(result.configuredLocation, base)
    return actual.origin !== expected.origin || actual.pathname !== expected.pathname
})
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ schemaVersion: 1, capturedAt: new Date().toISOString(), results }, null, 2)}\n`)
if (failures.length) throw new Error(`Live redirect baseline has ${failures.length} mismatch(es): ${failures.slice(0, 5).map((item) => item.source).join(', ')}`)
console.log(`live_redirect_baseline=pass routes=${results.length}`)
