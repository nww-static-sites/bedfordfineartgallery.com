import probe from 'probe-image-size'
import fs from 'fs'
import path from 'path'

const PAINTINGS_DIR = 'cms/paintings'
const CACHE_PATH = 'cms/image-dimensions-cache.json'

// Load persistent cache (keyed by URL)
let cache = {}
if (fs.existsSync(CACHE_PATH)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  } catch (e) {
    console.warn(`Warning: Could not parse ${CACHE_PATH}, starting with empty cache.`)
    cache = {}
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

async function updateImageDimensions(painting, imageType) {
  const url = painting[imageType]
  if (!url) return

  const wKey = `${imageType}Width`
  const hKey = `${imageType}Height`

  // ✅ Skip if already present
  if (painting[wKey] && painting[hKey]) return

  // ✅ Use persistent cache by URL
  if (cache[url]?.width && cache[url]?.height) {
    painting[wKey] = cache[url].width
    painting[hKey] = cache[url].height
    return
  }

  try {
    const result = await probe(url)

    painting[wKey] = result.width
    painting[hKey] = result.height

    cache[url] = { width: result.width, height: result.height }

    // Save periodically (cheap + safer if interrupted)
    saveCache()

    console.log(`  Probed ${imageType}: ${result.width}x${result.height} (${url})`)
  } catch (err) {
    console.warn(`  FAILED ${imageType}: ${url} :: ${err?.message || err}`)
  }
}

async function main() {
  const dir = fs.opendirSync(PAINTINGS_DIR)
  let dirent

  while ((dirent = dir.readSync()) !== null) {
    if (!dirent.isFile()) continue
    if (!dirent.name.endsWith('.json')) continue

    console.log(`Processing: ${dirent.name}`)
    const filePath = path.join(PAINTINGS_DIR, dirent.name)

    const painting = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    // Probe only when needed
    await updateImageDimensions(painting, 'gridImage')
    await updateImageDimensions(painting, 'mediumResImage')
    await updateImageDimensions(painting, 'highResImage')
    await updateImageDimensions(painting, 'artOnWallImage')

    fs.writeFileSync(filePath, JSON.stringify(painting, null, 2))
  }

  dir.closeSync()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
