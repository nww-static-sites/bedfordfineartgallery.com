import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const active = 'a'.repeat(40)
const values = new Map([
    ['@active', active],
    [`r:${active}:/old.html`, JSON.stringify({ status: 301, location: '/new.html' })],
    [`r:${active}:/media.mp3`, JSON.stringify({ status: 301, location: 'https://img.bedfordfineartgallery.com/media.mp3' })],
])
const source = fs.readFileSync(path.join(root, 'cloudfront-function.js'), 'utf8')
    .replace("import cf from 'cloudfront';", '')
    .concat('\nglobalThis.__handler = handler;\n')
const context = {
    cf: { kvs: () => ({ get: async (key) => {
        if (!values.has(key)) throw new Error('missing')
        return values.get(key)
    } }) },
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
assert.equal((await request('/ipad/george_t_hetzel.html')).uri, `/releases/${active}/ipad-shell.html`)
assert.equal((await request('/highlights_article_15.html-1')).uri, `/releases/${active}/highlights_article_15.html`)
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
values.delete('@active')
assert.equal((await request('/')).statusCode, 503)

console.log('cloudfront_function_tests=pass routing=exact+ipad+extensionless+canonical active=fail-closed')
