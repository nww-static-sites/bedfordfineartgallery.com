<template>
    <div class="bfa-testimonial-fade" aria-live="polite" @mouseenter="pause" @mouseleave="resume">
        <div class="bfa-testimonial-fade__content" :class="{ 'is-fading': isFading }">
            <p class="bfa-testimonial-fade__quote">{{ currentTestimonial.shortTestimonial }}</p>
            <p class="bfa-testimonial-fade__name">{{ currentTestimonial.name }}</p>
        </div>
    </div>
</template>

<script>
const FADE_MS = 420
const MIN_DWELL_MS = 7000
const MAX_DWELL_MS = 18000

export default {
    name: 'HomeTestimonialFade',
    props: {
        testimonials: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            currentIndex: 0,
            isFading: false,
            cycleTimer: null,
            fadeTimer: null,
            paused: false,
        }
    },
    computed: {
        currentTestimonial() {
            return this.testimonials[this.currentIndex] || { shortTestimonial: '', name: '' }
        },
        dwellTime() {
            const wordCount = String(this.currentTestimonial.shortTestimonial || '').trim().split(/\s+/).filter(Boolean).length
            return Math.min(MAX_DWELL_MS, Math.max(MIN_DWELL_MS, 3200 + wordCount * 320))
        },
    },
    mounted() {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.scheduleNext()
        }
    },
    beforeDestroy() {
        this.clearTimers()
    },
    methods: {
        scheduleNext() {
            this.clearTimers()
            if (this.paused || this.testimonials.length < 2) {
                return
            }

            this.cycleTimer = window.setTimeout(() => {
                this.isFading = true
                this.fadeTimer = window.setTimeout(() => {
                    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length
                    this.isFading = false
                    this.scheduleNext()
                }, FADE_MS)
            }, this.dwellTime)
        },
        clearTimers() {
            window.clearTimeout(this.cycleTimer)
            window.clearTimeout(this.fadeTimer)
        },
        pause() {
            this.paused = true
            this.clearTimers()
        },
        resume() {
            this.paused = false
            this.scheduleNext()
        },
    },
}
</script>

<style scoped>
.bfa-testimonial-fade {
    height: 132px;
    margin: 0 auto;
    max-width: 860px;
    overflow-y: auto;
    padding: 8px 12px;
    scrollbar-gutter: stable;
}

.bfa-testimonial-fade__content {
    opacity: 1;
    transition: opacity 420ms ease;
}

.bfa-testimonial-fade__content.is-fading {
    opacity: 0;
}

.bfa-testimonial-fade__quote,
.bfa-testimonial-fade__name {
    color: #f2f2f2;
    letter-spacing: 0;
    text-align: left;
}

.bfa-testimonial-fade__quote {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
    margin: 0;
}

.bfa-testimonial-fade__name {
    font-size: 14px;
    line-height: 1.4;
    margin: 10px 0 0;
}

@media screen and (max-width: 767px) {
    .bfa-testimonial-fade {
        height: 190px;
        padding: 8px 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bfa-testimonial-fade__content {
        transition: none;
    }
}
</style>
