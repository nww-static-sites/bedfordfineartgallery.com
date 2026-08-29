import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { validateTestimonials } from './testimonial-validation.mjs'

const projectRoot = process.cwd()
const sourceDirectory = path.join(projectRoot, 'cms', 'testimonials')
const generatedFile = path.join(projectRoot, 'dist', 'data', 'testimonials.json')
const pagesDirectory = path.join(projectRoot, 'pages')
const componentsDirectory = path.join(projectRoot, 'components')

function walkFiles(directory, extensionPattern) {
    const files = []

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolutePath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            files.push(...walkFiles(absolutePath, extensionPattern))
        } else if (extensionPattern.test(entry.name)) {
            files.push(absolutePath)
        }
    }

    return files
}

const sourceTestimonials = fs
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
    .sort(
        (a, b) =>
            a.name.localeCompare(b.name) ||
            a.shortTestimonial.localeCompare(b.shortTestimonial) ||
            a.id.localeCompare(b.id),
    )

validateTestimonials(sourceTestimonials)

if (!fs.existsSync(generatedFile)) {
    throw new Error(`Missing generated testimonial payload: ${generatedFile}`)
}

const generated = JSON.parse(fs.readFileSync(generatedFile, 'utf8'))
const canonicalTestimonials = JSON.stringify(sourceTestimonials)
const expectedDigest = `sha256-${crypto.createHash('sha256').update(canonicalTestimonials).digest('hex')}`

if (
    generated.schemaVersion !== 1 ||
    generated.contentDigest !== expectedDigest ||
    JSON.stringify(generated.testimonials) !== canonicalTestimonials
) {
    throw new Error('Generated testimonial payload does not exactly match the CMS testimonial records.')
}

const sourceCode = [...walkFiles(pagesDirectory, /\.vue$/), ...walkFiles(componentsDirectory, /\.vue$/)]
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n')

for (const forbidden of [
    "from '~/libs/testimonials'",
    ':testimonials="testimonials"',
    'testimonials: await loadShortTestimonials',
    'testimonials: await loadLongTestimonials',
]) {
    if (sourceCode.includes(forbidden)) {
        throw new Error(`Server-rendered testimonial source remains in a page or component: ${forbidden}`)
    }
}

const sampleText = sourceTestimonials[0].longTestimonial
const generatedHtmlFiles = walkFiles(path.join(projectRoot, 'dist'), /\.html?$/)

for (const file of generatedHtmlFiles) {
    if (fs.readFileSync(file, 'utf8').includes(sampleText)) {
        throw new Error(`Testimonial content remains embedded in generated HTML: ${file}`)
    }
}

const duplicateCandidates = walkFiles(path.join(projectRoot, 'dist'), /\.(?:html?|js|json)$/).filter(
    (file) => file !== generatedFile,
)

for (const file of duplicateCandidates) {
    if (fs.readFileSync(file, 'utf8').includes(sampleText)) {
        throw new Error(`Testimonial content is duplicated outside the shared payload: ${file}`)
    }
}

console.log(
    `Verified one shared client-loaded testimonial payload: ${sourceTestimonials.length} records, ` +
        `${generatedHtmlFiles.length} HTML files contain no embedded testimonial sample, ` +
        `and ${duplicateCandidates.length} generated text assets contain no duplicate testimonial sample.`,
)
