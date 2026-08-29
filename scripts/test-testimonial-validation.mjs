import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { validateTestimonials } from './testimonial-validation.mjs'

const base = {
    id: 'alpha',
    name: 'Alpha A.',
    shortTestimonial: 'A concise and useful customer comment.',
    longTestimonial:
        'A complete customer testimonial that is deliberately longer than one hundred and twenty characters so containment validation can be exercised safely and predictably.',
}

const second = {
    id: 'bravo',
    name: 'Bravo B.',
    shortTestimonial: 'A different concise customer comment.',
    longTestimonial:
        'A wholly separate customer testimonial with enough substance to resemble real content while remaining unrelated to the first synthetic record.',
}

validateTestimonials([base, second])
validateTestimonials([
    base,
    {
        ...base,
        id: 'near-duplicate',
        name: 'Alpha and Partner A.',
        longTestimonial: `${base.longTestimonial} Thank you again!`,
    },
])

assert.throws(
    () =>
        validateTestimonials([
            base,
            {
                ...base,
                id: 'duplicate',
                shortTestimonial: `  ${base.shortTestimonial}  `,
                longTestimonial: base.longTestimonial.replaceAll(' ', '  '),
            },
        ]),
    /Duplicate testimonial records/,
)

assert.throws(
    () =>
        validateTestimonials([
            base,
            {
                ...second,
                longTestimonial: `${second.longTestimonial}\n\nAlpha A.\n"${base.longTestimonial}"`,
            },
        ]),
    /standalone heading/,
)

assert.throws(
    () =>
        validateTestimonials([
            base,
            {
                ...second,
                longTestimonial: `${second.longTestimonial} ${base.longTestimonial}`,
            },
        ]),
    /plus a second substantial passage/,
)

const projectRoot = process.cwd()
const sourceDirectory = path.join(projectRoot, 'cms', 'testimonials')
const currentTestimonials = fs
    .readdirSync(sourceDirectory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
        const source = JSON.parse(fs.readFileSync(path.join(sourceDirectory, file), 'utf8'))
        return {
            id: path.basename(file, '.json'),
            name: source.name,
            shortTestimonial: source.shortTestimonial,
            longTestimonial: source.longTestimonial,
        }
    })

validateTestimonials(currentTestimonials)

console.log(`Verified testimonial recurrence guards and ${currentTestimonials.length} current source records.`)
