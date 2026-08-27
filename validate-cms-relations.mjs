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

const retiredPaintingHighlights = new Set(['custom framing available'])
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
      const routeKey = route.toLocaleLowerCase('en-US')
      const owner = `${collectionName}:${entry.filePath}`
      if (routeOwners.has(routeKey)) {
        errors.push(`${entry.filePath}: ${collectionName} route "${route}" collides with ${routeOwners.get(routeKey)}`)
      } else {
        routeOwners.set(routeKey, owner)
      }
    }
  }
}

for (const artist of artists.values()) {
  const artistPaintings = listValue(artist.data.paintings)
  const seenPaintings = new Set()
  for (const paintingId of artistPaintings) {
    if (seenPaintings.has(paintingId)) {
      errors.push(`${artist.filePath}: "${label(artist)}" lists painting "${paintingId}" more than once`)
      continue
    }
    seenPaintings.add(paintingId)
    if (!paintings.has(paintingId)) {
      errors.push(`${artist.filePath}: "${label(artist)}" references missing painting "${paintingId}"`)
      continue
    }
    const painting = paintings.get(paintingId)
    if ((painting.data.artist || '') !== artist.id) {
      errors.push(`${artist.filePath}: "${label(artist)}" lists painting "${paintingId}", but that painting points to artist "${painting.data.artist || '(none)'}"`)
    }
  }
}

for (const painting of paintings.values()) {
  if (painting.data.artist && !artists.has(painting.data.artist)) {
    errors.push(`${painting.filePath}: "${label(painting)}" references missing artist "${painting.data.artist}"`)
  }

  const memberships = []
  for (const artist of artists.values()) {
    if (listValue(artist.data.paintings).includes(painting.id)) memberships.push(artist.id)
  }
  if (painting.data.artist) {
    if (memberships.length !== 1 || memberships[0] !== painting.data.artist) {
      errors.push(`${painting.filePath}: "${label(painting)}" points to artist "${painting.data.artist}", but its Artist-page memberships are [${memberships.join(', ') || '(none)'}]`)
    }
  } else if (memberships.length > 0) {
    errors.push(`${painting.filePath}: unattributed painting "${label(painting)}" cannot appear on Artist page(s) [${memberships.join(', ')}]`)
  }

  for (const [index, highlight] of listValue(painting.data.highlights).entries()) {
    const highlightText = String(highlight.highlight || '').trim()

    if (retiredPaintingHighlights.has(highlightText.toLowerCase())) {
      errors.push(`${painting.filePath}: highlight ${index + 1} uses retired text "${highlightText}"`)
    }

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
