import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { validateTestimonials } from './testimonial-validation.mjs'

const projectRoot = process.cwd()
const sourceDirectory = path.join(projectRoot, 'cms', 'testimonials')
const outputFile = path.join(projectRoot, 'static', 'data', 'testimonials.json')
const requiredFields = ['name', 'shortTestimonial', 'longTestimonial']

const testimonials = fs
    .readdirSync(sourceDirectory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
        const source = JSON.parse(fs.readFileSync(path.join(sourceDirectory, file), 'utf8'))

        for (const field of requiredFields) {
            if (typeof source[field] !== 'string' || !source[field].trim()) {
                throw new Error(`${file} is missing a non-empty ${field} field.`)
            }
        }

        return {
            id: path.basename(file, '.json'),
            name: source.name,
            shortTestimonial: source.shortTestimonial,
            longTestimonial: source.longTestimonial,
        }
    })
    .sort(
        (a, b) =>
            a.name.localeCompare(b.name) ||
            a.shortTestimonial.localeCompare(b.shortTestimonial) ||
            a.id.localeCompare(b.id),
    )

validateTestimonials(testimonials)

const canonicalTestimonials = JSON.stringify(testimonials)
const output = {
    schemaVersion: 1,
    contentDigest: `sha256-${crypto.createHash('sha256').update(canonicalTestimonials).digest('hex')}`,
    testimonials,
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, `${JSON.stringify(output)}\n`)

console.log(`Generated one testimonial payload with ${testimonials.length} records: ${outputFile}`)
