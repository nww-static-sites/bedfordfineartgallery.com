import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.join(sourceRoot, 'template.json')
const functionPath = path.join(sourceRoot, 'cloudfront-function.js')
const outputPath = path.resolve(process.argv[2] || path.join(sourceRoot, 'compiled-template.json'))
const functionCode = fs.readFileSync(functionPath, 'utf8')

if (Buffer.byteLength(functionCode) > 10_000) {
    throw new Error(`CloudFront Function exceeds 10,000 bytes: ${Buffer.byteLength(functionCode)}`)
}

function replace(value) {
    if (value === '__FUNCTION_CODE__') return functionCode
    if (Array.isArray(value)) return value.map(replace)
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]))
    }
    return value
}

const template = replace(JSON.parse(fs.readFileSync(templatePath, 'utf8')))
fs.writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`)
console.log(`Compiled ${outputPath} with ${Buffer.byteLength(functionCode)}-byte edge function.`)
