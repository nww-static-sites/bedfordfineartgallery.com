export const loadShortTestimonials = ($content) => {
    return loadTestimonials({ $content, shortOrLong: 'short' })
}

export const loadLongTestimonials = ($content) => {
    return loadTestimonials({ $content, shortOrLong: 'long' })
}

async function loadTestimonials({ $content, shortOrLong }) {
    const testimonialField = `${shortOrLong}Testimonial`
    const testimonials = await $content('testimonials')
        .only(['name', `${shortOrLong}Testimonial`])
        .sortBy('name', 'asc')
        .fetch()

    return testimonials.sort((a, b) => {
        return a.name.localeCompare(b.name) || a[testimonialField].localeCompare(b[testimonialField])
    })
}
