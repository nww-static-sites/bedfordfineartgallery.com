function normalizeText(value) {
    return value.normalize('NFKC').replace(/\s+/gu, ' ').trim()
}

function normalizeIdentity(value) {
    return normalizeText(value).toLocaleLowerCase('en-US')
}

export function validateTestimonials(testimonials) {
    const exactRecords = new Map()
    const names = new Map()

    for (const testimonial of testimonials) {
        const normalizedName = normalizeIdentity(testimonial.name)
        const exactKey = [
            normalizedName,
            normalizeIdentity(testimonial.shortTestimonial),
            normalizeIdentity(testimonial.longTestimonial),
        ].join('\u0000')

        if (exactRecords.has(exactKey)) {
            const existing = exactRecords.get(exactKey)
            throw new Error(
                `Duplicate testimonial records after whitespace normalization: ${existing.id} and ${testimonial.id}.`,
            )
        }

        exactRecords.set(exactKey, testimonial)

        if (!names.has(normalizedName)) {
            names.set(normalizedName, [])
        }
        names.get(normalizedName).push(testimonial)
    }

    for (const testimonial of testimonials) {
        const normalizedLong = normalizeText(testimonial.longTestimonial)
        const testimonialName = normalizeIdentity(testimonial.name)
        const embeddedNames = testimonial.longTestimonial
            .split(/\r?\n/u)
            .map((line) => normalizeIdentity(line.replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/gu, '')))
            .filter(Boolean)

        for (const embeddedName of embeddedNames) {
            if (embeddedName === testimonialName || !names.has(embeddedName)) {
                continue
            }

            const namedRecords = names.get(embeddedName).filter((candidate) => candidate.id !== testimonial.id)

            if (namedRecords.length) {
                throw new Error(
                    `${testimonial.id} contains another testimonial customer's name as a standalone heading: ` +
                        `${namedRecords.map((candidate) => candidate.name).join(', ')}.`,
                )
            }
        }

        for (const candidate of testimonials) {
            if (candidate.id === testimonial.id) {
                continue
            }

            const candidateLong = normalizeText(candidate.longTestimonial)
            const additionalLength = normalizedLong.length - candidateLong.length
            if (candidateLong.length >= 120 && additionalLength >= 120 && normalizedLong.includes(candidateLong)) {
                throw new Error(
                    `${testimonial.id} contains the full testimonial text from ${candidate.id} ` +
                        'plus a second substantial passage.',
                )
            }
        }
    }
}
