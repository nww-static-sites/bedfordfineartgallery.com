<template>
    <section class="niche-testimonials" aria-label="Customer testimonials">
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
            <button v-if="canAnimate && visibleQuotes.length > 1" type="button" @click="toggleMotion">
                {{ paused ? 'Resume scrolling' : 'Pause scrolling' }}
            </button>
        </div>
    </section>
</template>

<script>
import { loadShortTestimonialsClient } from '~/libs/testimonials-client'

// The middle of the journey is faster than the edges. Each 85%-wide quote
// remains entirely in view for about 26 seconds around the seamless swap.
const motion = [
    { transform: 'translateX(0)', offset: 0, easing: 'ease-in' },
    { transform: 'translateX(-7.5%)', offset: 0.2, easing: 'ease-in-out' },
    { transform: 'translateX(-92.5%)', offset: 0.8, easing: 'ease-out' },
    { transform: 'translateX(-100%)', offset: 1 },
]
const motionOptions = { duration: 64000, fill: 'forwards' }

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
                this.quotes = rows.filter((row) => row.shortTestimonial.trim())
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
    --quote-lines: 4;
    --quote-leading: 1.5;
    --quote-size: clamp(1.1875rem, 2vw, 1.5rem);
    width: 100%;
    padding: 22px 0 18px;
    background: #ddd1ad;
    color: #4a3022;
}
.testimonial-window {
    position: relative;
    overflow: hidden;
    height: calc(var(--quote-lines) * var(--quote-leading) * var(--quote-size) + 2.25rem);
}
.testimonial-track {
    display: flex;
    width: 100%;
}
.testimonial-slide {
    flex: 0 0 100%;
    min-width: 0;
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px 16px;
    width: 85%;
    margin: 0 auto;
    font-size: 0.9375rem;
}
.testimonial-links a,
.testimonial-links button {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
}
.testimonial-links button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    cursor: pointer;
}
.testimonial-links a:focus-visible,
.testimonial-links button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}
@media (max-width: 650px) {
    .niche-testimonials {
        --quote-lines: 5;
    }
}
@media (max-width: 380px) {
    .testimonial-links {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
