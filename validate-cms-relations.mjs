import fs from 'fs'
import path from 'path'

const collections = {
  artists: 'cms/artists',
  paintings: 'cms/paintings',
  articles: 'cms/articles',
  artLoversNicheArticles: 'cms/artLoversNicheArticles',
}

function readJsonCollection(name) {
  const dir = collections[name]
  const entries = new Map()

  for (const file of fs.readdirSync(dir).filter((filename) => filename.endsWith('.json')).sort()) {
    const filePath = path.join(dir, file)
    const id = file.replace(/\.json$/, '')

    try {
      entries.set(id, {
        id,
        filePath,
        data: JSON.parse(fs.readFileSync(filePath, 'utf8')),
      })
    } catch (error) {
      throw new Error(`${filePath} is not valid JSON: ${error.message}`)
    }
  }

  return entries
}

function listValue(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function label(entry) {
  return entry.data.title || entry.data.name || entry.id
}

function routeFromSlug(slug) {
  return `/${slug.replace('-html', '.html')}`
}

const errors = []
const artists = readJsonCollection('artists')
const paintings = readJsonCollection('paintings')
const articles = readJsonCollection('articles')
const artLoversNicheArticles = readJsonCollection('artLoversNicheArticles')
const routeOwners = new Map()

for (const [collectionName, entries] of Object.entries({
  artists,
  paintings,
  articles,
  artLoversNicheArticles,
})) {
  for (const entry of entries.values()) {
    if (entry.data.slug && entry.data.slug !== entry.id) {
      errors.push(`${entry.filePath}: ${collectionName} slug "${entry.data.slug}" must match entry id "${entry.id}"`)
    }

    if (entry.data.slug) {
      const route = routeFromSlug(entry.data.slug)
      const owner = `${collectionName}:${entry.filePath}`
      if (routeOwners.has(route)) {
        errors.push(`${entry.filePath}: ${collectionName} route "${route}" collides with ${routeOwners.get(route)}`)
      } else {
        routeOwners.set(route, owner)
      }
    }
  }
}

for (const artist of artists.values()) {
  for (const paintingId of listValue(artist.data.paintings)) {
    if (!paintings.has(paintingId)) {
      errors.push(`${artist.filePath}: "${label(artist)}" references missing painting "${paintingId}"`)
    }
  }
}

for (const painting of paintings.values()) {
  if (painting.data.artist && !artists.has(painting.data.artist)) {
    errors.push(`${painting.filePath}: "${label(painting)}" references missing artist "${painting.data.artist}"`)
  }

  for (const [index, highlight] of listValue(painting.data.highlights).entries()) {
    if (highlight.pairedPainting && !paintings.has(highlight.pairedPainting)) {
      errors.push(`${painting.filePath}: highlight ${index + 1} references missing paired painting "${highlight.pairedPainting}"`)
    }
  }
}

if (errors.length > 0) {
  console.error('CMS relation validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`CMS relation validation passed: ${artists.size} artists, ${paintings.size} paintings, ${articles.size} articles, ${artLoversNicheArticles.size} art lovers niche articles`)
