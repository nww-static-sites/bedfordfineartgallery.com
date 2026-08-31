import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const paintingsDirectory = path.join(projectRoot, 'cms', 'paintings')
const artistsDirectory = path.join(projectRoot, 'cms', 'artists')
const outputDirectory = path.join(projectRoot, 'static', 'data')
const generatedDataPattern = /^ipad-paintings-[a-f0-9]{12}\.json$/

function loadJsonCollection(directory) {
    return fs
        .readdirSync(directory)
        .filter((file) => file.endsWith('.json'))
        .sort((a, b) => a.localeCompare(b))
        .map((file) => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))
}

function ipadPath(slug) {
    return `/ipad/${slug.replace('-html', '.html')}`
}

const artists = loadJsonCollection(artistsDirectory)
const artistBySlug = new Map(artists.map((artist) => [artist.slug, artist]))
const sourcePaintings = loadJsonCollection(paintingsDirectory).sort((a, b) => a.slug.localeCompare(b.slug))
const slugs = new Set()
const publicPaths = new Set()

const paintings = sourcePaintings.map((painting) => {
    if (!painting.slug || slugs.has(painting.slug)) {
        throw new Error(`Invalid or duplicate iPad painting slug: ${painting.slug || '(missing)'}`)
    }

    slugs.add(painting.slug)

    const publicPath = ipadPath(painting.slug)
    const pathAliases = publicPath.endsWith('.html')
        ? [publicPath, publicPath.slice(0, -5)]
        : [publicPath, `${publicPath}.html`]

    for (const alias of pathAliases) {
        if (publicPaths.has(alias)) {
            throw new Error(`Duplicate iPad public path: ${alias}`)
        }
        publicPaths.add(alias)
    }

    const artist = painting.artist ? artistBySlug.get(painting.artist) : null
    if (painting.artist && !artist) {
        throw new Error(`Painting ${painting.slug} references missing artist ${painting.artist}`)
    }

    return {
        ...painting,
        ipadPath: publicPath,
        artist: artist
            ? {
                  name: artist.name || '',
                  tinyDescription: artist.tinyDescription || '',
                  slug: artist.slug || '',
                  alias: artist.alias || '',
                  hasLandingPage: Boolean(artist.hasLandingPage),
              }
            : { name: '', tinyDescription: '', slug: '', alias: '', hasLandingPage: false },
    }
})

const payload = {
    schemaVersion: 1,
    paintings,
}
const payloadJson = JSON.stringify(payload)
const sha256 = crypto.createHash('sha256').update(payloadJson).digest('hex')
const file = `ipad-paintings-${sha256.slice(0, 12)}.json`
const activePaintingCount = paintings.filter((painting) => painting.status !== 'Sold').length
const manifest = {
    schemaVersion: 1,
    file: `/data/${file}`,
    sha256,
    paintingCount: paintings.length,
    activePaintingCount,
}

fs.mkdirSync(outputDirectory, { recursive: true })

for (const existingFile of fs.readdirSync(outputDirectory)) {
    if (generatedDataPattern.test(existingFile) && existingFile !== file) {
        fs.unlinkSync(path.join(outputDirectory, existingFile))
    }
}

fs.writeFileSync(path.join(outputDirectory, file), payloadJson)
fs.writeFileSync(path.join(outputDirectory, 'ipad-paintings-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(
    `Generated shared iPad data: ${paintings.length} paintings (${activePaintingCount} active), ` +
        `${Buffer.byteLength(payloadJson)} bytes, ${file}.`
)
