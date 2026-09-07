import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const active = 'a'.repeat(40)
const values = new Map([
    ['@active', active],
    [`@config:${active}`, '1'.repeat(64)],
    [`r:${active}:/old.html`, JSON.stringify({ status: 301, location: '/new.html' })],
    [`r:${active}:/media.mp3`, JSON.stringify({ status: 301, location: 'https://img.bedfordfineartgallery.com/media.mp3' })],
])
const source = fs.readFileSync(path.join(root, 'cloudfront-function.js'), 'utf8')
    .replace("import cf from 'cloudfront';", '')
    .concat('\nglobalThis.__handler = handler;\n')
assert.ok(!/for\s*\([^;)]*\sof\s/.test(source), 'CloudFront runtime does not support for-of loops')
assert.ok(!/\w+\(\s*await\s/.test(source), 'CloudFront runtime does not support await inside arguments')
const context = {
    cf: { kvs: () => ({ get: async (key) => {
        if (!values.has(key)) throw new Error('missing')
        return values.get(key)
    }, exists: async (key) => values.has(key) }) },
    encodeURIComponent,
}
vm.createContext(context)
vm.runInContext(source, context)

function request(uri, host = 'preview.example.net', querystring = {}) {
    return context.__handler({ request: { uri, headers: { host: { value: host } }, querystring } })
}

assert.equal((await request('/')).uri, `/releases/${active}/index.html`)
assert.equal((await request('/Artists')).uri, `/releases/${active}/Artists.html`)
assert.equal((await request('/Artists.html')).uri, `/releases/${active}/Artists.html`)
assert.equal((await request('/admin/')).uri, `/releases/${active}/admin/index.html`)
assert.equal((await request('/errors/404.html')).uri, '/errors/404.html')
assert.equal((await request('/ipad/george_t_hetzel.html')).uri, `/releases/${active}/ipad-shell.html`)
assert.equal((await request('/highlights_article_15.html-1')).uri, `/releases/${active}/highlights_article_15.html-1.html`)
assert.equal((await request('/old.html')).headers.location.value, '/new.html')
assert.equal((await request('/media.mp3')).headers.location.value, 'https://img.bedfordfineartgallery.com/media.mp3')
assert.equal(
    (await request('/old.html', 'preview.example.net', { ref: { value: 'gallery test' } })).headers.location.value,
    '/new.html?ref=gallery%20test',
)
assert.equal(
    (await request('/Artists', 'bedfordfineartgallery.com', { x: { value: '1' } })).headers.location.value,
    'https://www.bedfordfineartgallery.com/Artists?x=1',
)
const table = 'c'.repeat(64)
values.set(`@config:${active}`, JSON.stringify({ v: 2, routeSet: table }))
values.set(`@routes-ready:${table}`, JSON.stringify({ v: 2, routeSet: table, count: 1 }))
values.set(`r2:${table}:/old.html`, JSON.stringify({ status: 301, location: '/shared.html' }))
assert.equal((await request('/old.html')).headers.location.value, '/shared.html')
assert.equal((await request('/Artists')).uri, `/releases/${active}/Artists.html`)
values.delete(`@routes-ready:${table}`)
assert.equal((await request('/Artists')).statusCode, 503)
values.set(`@routes-ready:${table}`, JSON.stringify({ v: 2, routeSet: table, count: -1 }))
assert.equal((await request('/')).statusCode, 503)
values.set(`@config:${active}`, 'broken')
assert.equal((await request('/')).statusCode, 503)
values.set(`@config:${active}`, '1'.repeat(64))
assert.equal((await request('/old.html')).headers.location.value, '/new.html')
values.set(`r:${active}:/old.html`, '{')
assert.equal((await request('/old.html')).statusCode, 503)
values.delete(`@config:${active}`)
assert.equal((await request('/')).statusCode, 503)
values.delete('@active')
assert.equal((await request('/')).statusCode, 503)

const retained = 'b'.repeat(40)
const base = `/_nuxt/r/${retained}/`
assert.equal((await request(base+'chunk.js')).statusCode,404)
values.set('@assets:'+retained,'nuxt-r-v1')
for (const suffix of ['runtime.123abc.js','style.123abc.css','fonts/example.woff2',`static/${retained}/árvíztűrő-html/payload.js`]) {
    assert.equal((await request(base+suffix)).uri,`/releases/${retained}${base}${suffix}`)
}
for (const suffix of ['../control/x.json','%2e%2e/control/x.js','%252e%252e/x.js','x%2fsecret.js','x%5csecret.js',
    'a//b.js','a/./b.js','x?z.js','x#z.js','config.json','index.html','.env','x%00.js','%zz.js']) {
    assert.equal((await request(base+suffix)).statusCode,404,suffix)
}
for (const route of ['/_nuxt/r','/_nuxt/r/','/_nuxt/r/not-a-release/chunk.js',`/_nuxt/r/${retained.toUpperCase()}/chunk.js`]) assert.equal((await request(route)).statusCode,404)
values.set('@assets:'+retained,'invalid')
assert.equal((await request(base+'chunk.js')).statusCode,503)
values.set('@assets:'+retained,'nuxt-r-v1')
values.set('@asset-path:/_nuxt/legacy.123abc.js',retained)
values.set('@asset-path:/data/ipad-paintings-123456abcdef.json',retained)
for (const current of [active,retained,active]) {
    values.set('@active',current);values.set('@config:'+current,'1'.repeat(64))
    assert.equal((await request(base+'chunk.js')).uri,`/releases/${retained}${base}chunk.js`)
    assert.equal((await request('/_nuxt/legacy.123abc.js')).uri,`/releases/${retained}/_nuxt/legacy.123abc.js`)
    assert.equal((await request('/data/ipad-paintings-123456abcdef.json')).uri,`/releases/${retained}/data/ipad-paintings-123456abcdef.json`)
    assert.equal((await request('/data/testimonials.json')).uri,`/releases/${current}/data/testimonials.json`)
    assert.equal((await request('/data/ipad-paintings-manifest.json')).uri,`/releases/${current}/data/ipad-paintings-manifest.json`)
}
values.set('@asset-path:/_nuxt/legacy.123abc.js','malformed')
assert.equal((await request('/_nuxt/legacy.123abc.js')).statusCode,503)

assert.ok(Buffer.byteLength(source) < 10000)
console.log('cloudfront_function_tests=pass routing=legacy+shared+ipad+extensionless+canonical readiness=fail-closed rollback=pass')
