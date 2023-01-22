import probe from 'probe-image-size'
import fs from 'fs'

async function updateImageDimensions(painting, imageType) {
  const result = await probe(painting[imageType])
	painting[`${imageType}Width`] = result.width
	painting[`${imageType}Height`] = result.height
}

async function main() {
  const paintingsDir = fs.opendirSync('cms/paintings')
  let dirent
  while ((dirent = paintingsDir.readSync()) !== null) {
    console.log(`Processing: ${dirent.name}`)
    const path = `cms/paintings/${dirent.name}`

    const painting = JSON.parse(fs.readFileSync(path))

    if (painting.gridImage) {
      await updateImageDimensions(painting, 'gridImage')
    }
    if (painting.mediumResImage) {
      await updateImageDimensions(painting, 'mediumResImage')
    }
    if (painting.highResImage) {
      await updateImageDimensions(painting, 'highResImage')
    }

    console.log(`Writing: ${dirent.name}`)
    fs.writeFileSync(path, JSON.stringify(painting, null, 2))
  }

  paintingsDir.closeSync()

  return 0
}

main()