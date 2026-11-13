<template>
    <section id="niche-testimonials" class="niche-testimonials" aria-label="Customer testimonials">
        <div class="testimonial-window">
            <div ref="track" class="testimonial-track">
                <div
                    v-for="(testimonial, position) in visibleQuotes"
                    :key="testimonial.id"
                    class="testimonial-slide"
                    :aria-hidden="position === 1 ? 'true' : null"
                >
                    <figure class="testimonial-quote">
                        <blockquote><p>“{{ testimonial.shortTestimonial }}”</p></blockquote>
                        <figcaption>{{ testimonial.name }}</figcaption>
                    </figure>
                </div>
            </div>
            <p v-if="!visibleQuotes.length" class="testimonial-message">
                {{ loading ? 'Loading testimonials…' : 'Read what our customers are saying.' }}
            </p>
        </div>
        <div class="testimonial-links">
            <nuxt-link to="/testimonials.htm">Read all testimonials</nuxt-link>
            <button
                v-if="canAnimate && visibleQuotes.length > 1"
                type="button"
                :aria-label="paused ? 'Play testimonials' : 'Pause testimonials'"
                :title="paused ? 'Play testimonials' : 'Pause testimonials'"
                @click="toggleMotion"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path v-if="paused" d="M4 2.5 13 8l-9 5.5z" fill="currentColor" />
                    <path v-else d="M4 2.5h3v11H4zm5 0h3v11H9z" fill="currentColor" />
                </svg>
            </button>
        </div>
    </section>
</template>

<script>
import { loadShortTestimonialsClient } from '~/libs/testimonials-client'

// The middle of the journey is faster than the edges. Each 85%-wide quote
// remains entirely in view for about 22 seconds around the seamless swap.
const motion = [
    { transform: 'translateX(0)', offset: 0, easing: 'ease-in' },
    { transform: 'translateX(-7.5%)', offset: 0.2, easing: 'ease-in-out' },
    { transform: 'translateX(-92.5%)', offset: 0.8, easing: 'ease-out' },
    { transform: 'translateX(-100%)', offset: 1 },
]
const motionOptions = { duration: 64000 / 1.15, fill: 'forwards' }

function hasReadableLength(quote) {
    const words =
        quote.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\u2010\u2011-][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu) || []
    return words.length >= 10 && words.length <= 40
}

export default {
    data() {
        return { quotes: [], loading: true, index: 0, paused: false, canAnimate: false }
    },
    computed: {
        visibleQuotes() {
            const { quotes, index } = this
            if (quotes.length < 2) return quotes
            return [quotes[index], quotes[(index + 1) % quotes.length]]
        },
    },
    mounted() {
        this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        if (this.motionPreference.addEventListener) {
            this.motionPreference.addEventListener('change', this.updateMotionPreference)
        } else {
            this.motionPreference.addListener(this.updateMotionPreference)
        }
        this.updateMotionPreference()
        document.addEventListener('visibilitychange', this.syncMotion)
        if ('IntersectionObserver' in window) {
            this.viewportObserver = new IntersectionObserver(([entry]) => {
                this.inView = entry.isIntersecting
                this.syncMotion()
            })
            this.viewportObserver.observe(this.$el)
        } else {
            this.inView = true
        }
        loadShortTestimonialsClient()
            .then((rows) => {
                if (this.disposed) return
                this.quotes = rows.filter((row) => hasReadableLength(row.shortTestimonial))
                this.loading = false
                this.$nextTick(this.syncMotion)
            })
            .catch(() => {
                if (!this.disposed) this.loading = false
            })
    },
    beforeDestroy() {
        this.disposed = true
        if (this.motionPreference.removeEventListener) {
            this.motionPreference.removeEventListener('change', this.updateMotionPreference)
        } else {
            this.motionPreference.removeListener(this.updateMotionPreference)
        }
        document.removeEventListener('visibilitychange', this.syncMotion)
        if (this.viewportObserver) this.viewportObserver.disconnect()
        this.stopMotion()
    },
    methods: {
        updateMotionPreference() {
            this.canAnimate = !this.motionPreference.matches && typeof this.$refs.track.animate === 'function'
            if (!this.canAnimate) this.stopMotion()
            this.syncMotion()
        },
        toggleMotion() {
            this.paused = !this.paused
            this.syncMotion()
        },
        stopMotion() {
            if (!this.scrolling) return
            this.scrolling.onfinish = null
            this.scrolling.cancel()
            this.scrolling = null
        },
        syncMotion() {
            if (this.disposed || !this.canAnimate || this.quotes.length < 2) return
            if (this.paused || !this.inView || document.hidden) {
                if (this.scrolling) this.scrolling.pause()
                return
            }
            if (this.scrolling) {
                if (this.scrolling.playState === 'paused') this.scrolling.play()
                return
            }
            this.scrolling = this.$refs.track.animate(motion, motionOptions)
            this.scrolling.onfinish = () => {
                this.index = (this.index + 1) % this.quotes.length
                this.$nextTick(() => {
                    this.stopMotion()
                    this.syncMotion()
                })
            }
        },
    },
}
</script>

<style scoped>
.niche-testimonials {
    --quote-lines: 3;
    --quote-leading: 1.3;
    --quote-size: clamp(1.1875rem, 2vw, 1.5rem);
    --previous-lines: 4;
    --previous-controls: 44px;
    /* Preserve 60% of the former quote window, padding, and controls together. */
    --band-height: calc((var(--previous-lines) * 1.5 * var(--quote-size) + 2.25rem + 40px + var(--previous-controls)) * 0.6);
    --control-height: 32px;
    width: 100%;
    height: var(--band-height);
    position: relative;
    background: #ddd1ad;
    color: #4a3022;
}
.testimonial-window {
    position: relative;
    overflow: hidden;
    height: calc(var(--band-height) - var(--control-height));
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
}
.testimonial-track,
.testimonial-message {
    grid-area: 1 / 1;
}
.testimonial-track {
    display: flex;
    width: 100%;
}
.testimonial-slide {
    flex: 0 0 100%;
    min-width: 0;
    align-self: center;
}
.testimonial-quote {
    width: 85%;
    margin: 0 auto;
    font-family: Georgia, 'Times New Roman', serif;
    text-align: left;
}
.testimonial-quote blockquote p {
    display: -webkit-box;
    overflow: hidden;
    overflow-wrap: anywhere;
    margin: 0;
    padding: 0;
    color: inherit;
    font-family: inherit;
    font-size: var(--quote-size);
    font-style: italic;
    line-height: var(--quote-leading);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--quote-lines);
}
.testimonial-quote figcaption {
    overflow: hidden;
    margin-top: 6px;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.testimonial-message {
    width: 85%;
    margin: 0 auto;
    font: italic var(--quote-size) / var(--quote-leading) Georgia, 'Times New Roman', serif;
}
.testimonial-links {
    position: absolute;
    inset: auto 7.5% 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--control-height);
    font-size: 0.9375rem;
}
.testimonial-links a,
.testimonial-links button {
    display: inline-flex;
    min-height: var(--control-height);
    align-items: center;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
}
.testimonial-links button {
    justify-content: center;
    width: var(--control-height);
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    font: inherit;
    cursor: pointer;
}
.testimonial-links button:hover {
    background: rgb(74 48 34 / 10%);
}
.testimonial-links a:focus-visible,
.testimonial-links button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}
@media (max-width: 650px) {
    .niche-testimonials {
        --previous-lines: 5;
    }
}
@media (max-width: 380px) {
    .niche-testimonials {
        --previous-controls: 92px;
        --quote-lines: 4;
    }
}
</style>
