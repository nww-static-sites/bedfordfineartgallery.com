import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const outputRoot = path.join(projectRoot, 'dist')
const manifestPath = path.join(outputRoot, 'data', 'ipad-paintings-manifest.json')
const redirectsPath = path.join(outputRoot, '_redirects')

function fail(message) {
    console.error(`Shared iPad data validation failed: ${message}`)
    process.exit(1)
}

if (!fs.existsSync(path.join(outputRoot, 'ipad-shell.html'))) {
    fail('dist/ipad-shell.html is missing')
}

if (fs.existsSync(path.join(outputRoot, 'ipad.html'))) {
    fail('dist/ipad.html would conflict with Netlify pretty-URL normalization')
}

if (!fs.existsSync(manifestPath)) {
    fail('the iPad data manifest is missing')
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const dataPath = path.join(outputRoot, manifest.file.replace(/^\//, ''))

if (!fs.existsSync(dataPath)) {
    fail(`the versioned data file ${manifest.file} is missing`)
}

const dataJson = fs.readFileSync(dataPath, 'utf8')
const actualHash = crypto.createHash('sha256').update(dataJson).digest('hex')
const data = JSON.parse(dataJson)
const sourcePaintingCount = fs.readdirSync(path.join(projectRoot, 'cms', 'paintings')).filter((file) => file.endsWith('.json')).length

if (actualHash !== manifest.sha256) {
    fail(`manifest hash ${manifest.sha256} does not match data hash ${actualHash}`)
}

if (!Array.isArray(data.paintings) || data.paintings.length !== sourcePaintingCount) {
    fail(`expected ${sourcePaintingCount} paintings but found ${data.paintings && data.paintings.length}`)
}

if (manifest.paintingCount !== sourcePaintingCount) {
    fail(`manifest painting count ${manifest.paintingCount} does not match ${sourcePaintingCount}`)
}

const activePaintingCount = data.paintings.filter((painting) => painting.status !== 'Sold').length
if (manifest.activePaintingCount !== activePaintingCount) {
    fail(`manifest active count ${manifest.activePaintingCount} does not match ${activePaintingCount}`)
}

const slugs = new Set()
const paths = new Set()
for (const painting of data.paintings) {
    if (!painting.slug || slugs.has(painting.slug)) {
        fail(`invalid or duplicate painting slug ${painting.slug}`)
    }
    if (!painting.ipadPath || paths.has(painting.ipadPath)) {
        fail(`invalid or duplicate iPad path ${painting.ipadPath}`)
    }
    if (!painting.artist || typeof painting.artist.name !== 'string') {
        fail(`painting ${painting.slug} does not have a resolved artist object`)
    }
    slugs.add(painting.slug)
    paths.add(painting.ipadPath)
}

const generatedIpadDirectory = path.join(outputRoot, 'ipad')
if (fs.existsSync(generatedIpadDirectory)) {
    const duplicatePages = fs.readdirSync(generatedIpadDirectory).filter((file) => file.endsWith('.html'))
    if (duplicatePages.length > 0) {
        fail(`found ${duplicatePages.length} independently generated iPad painting pages`)
    }
}

const redirects = fs.readFileSync(redirectsPath, 'utf8')
for (const expectedRule of ['/ipad/ /ipad 301!', '/ipad /ipad-shell.html 200!', '/ipad/* /ipad-shell.html 200!']) {
    if (!redirects.includes(expectedRule)) {
        fail(`missing redirect rule: ${expectedRule}`)
    }
}

console.log(
    `Shared iPad data validation passed: ${sourcePaintingCount} preserved painting URLs, ` +
        `${activePaintingCount} active gallery paintings, one ${fs.statSync(dataPath).size}-byte shared data file.`
)
