const TESTIMONIALS_URL = '/data/testimonials.json'

let testimonialDataPromise

function validateTestimonialData(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.testimonials)) {
        throw new Error('The testimonial data response is not valid.')
    }

    for (const testimonial of data.testimonials) {
        if (
            !testimonial ||
            typeof testimonial.id !== 'string' ||
            typeof testimonial.name !== 'string' ||
            typeof testimonial.shortTestimonial !== 'string' ||
            typeof testimonial.longTestimonial !== 'string'
        ) {
            throw new Error('A testimonial record is not valid.')
        }
    }

    return data
}

export function loadTestimonialData() {
    if (!process.client) {
        return Promise.resolve({ schemaVersion: 1, contentDigest: '', testimonials: [] })
    }

    if (!testimonialDataPromise) {
        testimonialDataPromise = window
            .fetch(TESTIMONIALS_URL, {
                credentials: 'same-origin',
                headers: { accept: 'application/json' },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load testimonials (${response.status}).`)
                }

                return response.json()
            })
            .then(validateTestimonialData)
            .catch((error) => {
                testimonialDataPromise = null
                throw error
            })
    }

    return testimonialDataPromise
}

export function loadShortTestimonialsClient() {
    return loadTestimonialData().then((data) =>
        data.testimonials.map(({ id, name, shortTestimonial }) => ({ id, name, shortTestimonial }))
    )
}

export function loadLongTestimonialsClient() {
    return loadTestimonialData().then((data) =>
        data.testimonials.map(({ id, name, longTestimonial }) => ({ id, name, longTestimonial }))
    )
}
