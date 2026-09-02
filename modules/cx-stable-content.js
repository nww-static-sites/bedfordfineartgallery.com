const { join } = require('path')
const nativeFs = require('fs')
const fs = require('graceful-fs').promises
const clientLoadedContentDirectories = new Set(['/testimonials'])

async function collectContentPaths(database, dir, files) {
    let entries = []

    try {
        entries = (await fs.readdir(dir)).sort((a, b) => a.localeCompare(b))
    } catch (error) {
        return
    }

    for (const entry of entries) {
        if (entry.includes('node_modules') || /(^|\/)\.[^/.]/.test(entry)) {
            continue
        }

        const path = join(dir, entry)
        const stats = await fs.stat(path)

        if (stats.isDirectory()) {
            const normalizedPath = database.normalizePath(path)
            if (clientLoadedContentDirectories.has(normalizedPath)) {
                continue
            }

            database.dirs.push(normalizedPath)
            await collectContentPaths(database, path, files)
        } else if (stats.isFile()) {
            files.push(path)
        }
    }
}

module.exports = function stabilizeContentDatabase() {
    const Database = require('@nuxt/content/lib/database')
    const isStaticBuild = this.options.dev === false && (
        this.options.target === 'static' ||
        this.options._generate ||
        this.options.mode === 'spa'
    )
    let stableContentTimestamp = ''

    if (isStaticBuild) {
        const releaseStatePath = join(this.options.rootDir, 'static', 'release-state.json')
        const releaseState = JSON.parse(nativeFs.readFileSync(releaseStatePath, 'utf8'))
        stableContentTimestamp = String(releaseState.requestedAt || '')

        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(stableContentTimestamp)) {
            throw new Error('Static generation requires a stable release-state requestedAt timestamp')
        }
    }

    Database.prototype.init = async function initStableContentDatabase() {
        this.dirs = ['/']
        this.items.clear()

        const files = []
        await collectContentPaths(this, this.dir, files)

        const parsedItems = await Promise.all(files.map((file) => this.parseFile(file)))

        for (const item of parsedItems) {
            if (!item) {
                continue
            }

            if (stableContentTimestamp) {
                // Nuxt Content otherwise derives createdAt from filesystem birth
                // time, making thousands of generated files differ on every
                // clean checkout.  The immutable release request time is both
                // meaningful and repeatable for the exact same release commit.
                item.createdAt = stableContentTimestamp
                item.updatedAt = stableContentTimestamp
            }

            await this.callHook('file:beforeInsert', item)
            this.items.insert(item)

            if (item.meta) {
                item.meta.created = 0
            }
        }
    }
}
