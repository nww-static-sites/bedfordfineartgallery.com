const { join } = require('path')
const fs = require('graceful-fs').promises

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
            database.dirs.push(database.normalizePath(path))
            await collectContentPaths(database, path, files)
        } else if (stats.isFile()) {
            files.push(path)
        }
    }
}

module.exports = function stabilizeContentDatabase() {
    const Database = require('@nuxt/content/lib/database')

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

            await this.callHook('file:beforeInsert', item)
            this.items.insert(item)

            if (item.meta) {
                item.meta.created = 0
            }
        }
    }
}
