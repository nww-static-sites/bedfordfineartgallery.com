// Build-only metadata injection: no article HTML/decoder enters listing payloads.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

module.exports = function nicheThumbnails() {
    const root = this.options.rootDir
    const manifestPath = path.join(root, '.generated/niche-thumbnails.json')
    let images = {}
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        const directory = path.join(root, 'cms/artLoversNicheArticles')
        const hashes = {}
        for (const name of fs.readdirSync(directory).filter(n => n.endsWith('.json')).sort()) {
            hashes[name] = crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, name))).digest('hex')
        }
        const contentHash = crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex')
        if (manifest.schemaVersion !== 1 || manifest.contentHash !== contentHash ||
            Object.keys(manifest.images).sort().join('|') !== Object.keys(hashes).map(n => n.slice(0, -5)).sort().join('|')) {
            throw new Error('Prepared Niche thumbnails do not match this content snapshot')
        }
        images = manifest.images
        for (const image of Object.values(images)) {
            if (image && (!/^https:\/\/img\.bedfordfineartgallery\.com\/derived\/niche-v1\/[a-f0-9]{64}\.(jpg|png)$/.test(image.src) ||
                !Number.isInteger(image.width) || image.width < 1 || image.width > 440 ||
                !Number.isInteger(image.height) || image.height < 1 || image.height > 360 || typeof image.alt !== 'string')) {
                throw new Error('Invalid Niche thumbnail metadata')
            }
        }
    } else if (!this.options.dev) {
        throw new Error('Static publication requires publisher-prepared Niche thumbnails')
    }
    this.nuxt.hook('content:file:beforeInsert', (document) => {
        if (document.dir === '/artLoversNicheArticles') {
            document.listingImage = images[document.slug] || null
        }
    })
}
