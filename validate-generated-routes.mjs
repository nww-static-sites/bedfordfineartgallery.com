import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const outputRoot = path.join(projectRoot, 'dist')

function loadCollection(name) {
    const collectionDirectory = path.join(projectRoot, 'cms', name)
    return fs.readdirSync(collectionDirectory).map((file) => {
        return JSON.parse(fs.readFileSync(path.join(collectionDirectory, file), 'utf8'))
    })
}

function routeOutputFile(slug, prefix = '') {
    const route = slug.replace('-html', '.html')
    const file = /\.html?$/.test(route) ? route : `${route}.html`
    return path.join(prefix, file)
}

const expectedRoutes = new Set([
    'index.html',
    'Artists--Bios.html',
    'Artists.html',
    'Directions.html',
    'Gallery-Value.html',
    'faq.html',
    'privacy.htm',
    'art_lovers_niche.htm',
    'notable_sales.html',
    'landscape_artwork.html',
    'victorian_art.html',
    'ipad.html',
    path.join('admin', 'index.html'),
])

const paintings = loadCollection('paintings')
const artists = loadCollection('artists').filter((artist) => artist.hasLandingPage)
const articles = loadCollection('articles')
const artLoversNicheArticles = loadCollection('artLoversNicheArticles')

for (const painting of paintings) {
    expectedRoutes.add(routeOutputFile(painting.slug))
    expectedRoutes.add(routeOutputFile(painting.slug, 'ipad'))
}

for (const artist of artists) {
    expectedRoutes.add(routeOutputFile(artist.slug))
}

for (const article of articles) {
    expectedRoutes.add(routeOutputFile(article.slug))
}

for (const article of artLoversNicheArticles) {
    expectedRoutes.add(routeOutputFile(article.slug))
}

const missingRoutes = [...expectedRoutes]
    .filter((route) => !fs.existsSync(path.join(outputRoot, route)))
    .sort()

if (missingRoutes.length > 0) {
    console.error(`Generated route validation failed. Missing ${missingRoutes.length} expected public file(s):`)
    for (const route of missingRoutes) {
        console.error(`- ${route}`)
    }
    process.exit(1)
}

console.log(
    `Generated route validation passed: ${expectedRoutes.size} files ` +
        `(${paintings.length} paintings, ${artists.length} artists, ${articles.length} articles, ` +
        `${artLoversNicheArticles.length} Art Lovers' Niche articles, and ${paintings.length} iPad paintings).`
)
