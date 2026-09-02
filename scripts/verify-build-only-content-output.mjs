/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const generatedRoot = path.join(projectRoot, 'dist')
const clientRoot = path.join(generatedRoot, '_nuxt')
const forbiddenDirectories = [
    path.join(clientRoot, 'content'),
    path.join(projectRoot, '.nuxt', 'dist', 'client', 'content'),
]
const forbiddenBundleMarkers = [
    'fullTextSearchFields',
    '/content/db-',
]

function listFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name)
        return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
    })
}

if (!fs.existsSync(clientRoot)) {
    throw new Error(`Missing generated client output: ${clientRoot}`)
}

for (const directory of forbiddenDirectories) {
    if (fs.existsSync(directory)) {
        throw new Error(`Generated browser content database was not excluded: ${directory}`)
    }
}

const clientJavaScriptFiles = listFiles(clientRoot).filter((file) => file.endsWith('.js'))
for (const file of clientJavaScriptFiles) {
    const source = fs.readFileSync(file, 'utf8')
    for (const marker of forbiddenBundleMarkers) {
        if (source.includes(marker)) {
            throw new Error(`Generated client bundle still contains the Nuxt Content browser loader marker ${marker}: ${file}`)
        }
    }
}

const generatedFiles = listFiles(generatedRoot)
const generatedBytes = generatedFiles.reduce((total, file) => total + fs.statSync(file).size, 0)

console.log(
    `Build-only Nuxt Content output validation passed: ${generatedFiles.length} files, ` +
    `${generatedBytes} bytes, and no browser database or lazy-loader bundle.`,
)
