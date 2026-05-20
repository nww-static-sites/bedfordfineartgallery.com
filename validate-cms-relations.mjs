import fs from 'fs'
import path from 'path'

const collections = {
  artists: 'cms/artists',
  paintings: 'cms/paintings',
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

const errors = []
const artists = readJsonCollection('artists')
const paintings = readJsonCollection('paintings')

for (const artist of artists.values()) {
  if (artist.data.slug && artist.data.slug !== artist.id) {
    errors.push(`${artist.filePath}: artist slug "${artist.data.slug}" must match entry id "${artist.id}"`)
  }

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

console.log(`CMS relation validation passed: ${artists.size} artists, ${paintings.size} paintings`)
