const fs = require('fs')
const path = require('path')
const consola = require('consola').withScope('cx-build-only-content')
const contentModule = require('@nuxt/content')

const browserPluginTemplates = new Set([
    'content/plugin.client.js',
    'content/plugin.client.lazy.js',
    'content/query-builder.js',
])

const browserPluginEntries = new Set([
    'content/plugin.client.js',
])

function listFiles(directory) {
    if (!fs.existsSync(directory)) {
        return []
    }

    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name)
        return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
    })
}

function removeGeneratedBrowserDatabase(directories) {
    let removedBytes = 0
    let removedFiles = 0

    for (const directory of directories) {
        const files = listFiles(directory)

        for (const file of files) {
            if (!/^db-[a-f0-9]{8}\.json$/.test(path.basename(file))) {
                throw new Error(`Refusing to remove unexpected Nuxt Content output: ${file}`)
            }

            removedBytes += fs.statSync(file).size
            removedFiles += 1
        }

        fs.rmSync(directory, { recursive: true, force: true })
    }

    if (removedFiles === 0) {
        throw new Error('Nuxt Content did not generate the expected static browser database')
    }

    consola.success(`Excluded ${removedFiles} generated browser database copies (${removedBytes} bytes before exclusion)`)
}

module.exports = async function buildOnlyContent(moduleOptions) {
    const isStaticBuild = this.options.dev === false && (
        this.options.target === 'static' ||
        this.options._generate ||
        this.options.mode === 'spa'
    )

    await contentModule.call(this, moduleOptions)

    if (!isStaticBuild) {
        return
    }

    const templatePathByDestination = new Map(
        this.options.build.templates.map((template) => [
            template.dst,
            path.join(this.options.buildDir, template.dst),
        ]),
    )
    const expectedPluginPaths = new Set(
        [...browserPluginEntries].map((destination) => templatePathByDestination.get(destination)),
    )

    if ([...expectedPluginPaths].some((pluginPath) => !pluginPath)) {
        throw new Error('Could not identify the expected Nuxt Content browser plugins')
    }

    const removedPluginPaths = this.options.plugins
        .filter((plugin) => expectedPluginPaths.has(plugin.src))
        .map((plugin) => plugin.src)

    if (removedPluginPaths.length !== expectedPluginPaths.size) {
        const contentPluginPaths = this.options.plugins
            .map((plugin) => plugin.src)
            .filter((pluginPath) => typeof pluginPath === 'string' && pluginPath.includes(`${path.sep}content${path.sep}`))
        throw new Error(
            `Expected to remove ${expectedPluginPaths.size} Nuxt Content browser plugins; ` +
            `found ${removedPluginPaths.length}. Registered content plugins: ${contentPluginPaths.join(', ')}`,
        )
    }

    this.options.plugins = this.options.plugins.filter((plugin) => !expectedPluginPaths.has(plugin.src))
    this.options.build.templates = this.options.build.templates.filter(
        (template) => !browserPluginTemplates.has(template.dst),
    )

    const buildDatabaseDirectory = path.join(this.options.buildDir, 'dist', 'client', 'content')
    fs.rmSync(buildDatabaseDirectory, { recursive: true, force: true })

    this.nuxt.hook('generate:done', () => {
        const publicPath = this.options.build.publicPath.replace(/^\/+|\/+$/g, '')
        const generatedDatabaseDirectory = path.join(this.options.generate.dir, publicPath, 'content')

        removeGeneratedBrowserDatabase([
            buildDatabaseDirectory,
            generatedDatabaseDirectory,
        ])
    })
}
