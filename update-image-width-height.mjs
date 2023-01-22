import fs from 'fs'

const getImageMetaData = async (path) => {
  const img = new Image();
  img.src = `https://res.cloudinary.com/dg6smdedp/image/fetch${path}`;
  await img.decode();
  return img
};

async function updateImageDimensions(painting, imageType) {
  const img = await getImageMetaData(painting[imageType])
	painting[`${imageType}Width`] = img.naturalWidth
	painting[`${imageType}Height`] = img.naturalHeight
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