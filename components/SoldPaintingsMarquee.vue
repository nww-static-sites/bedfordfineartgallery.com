<template>
    <section
        v-if="selectedPaintings.length"
        ref="root"
        class="sold-marquee"
        :class="{ 'sold-marquee--ready': animationReady }"
        aria-label="A daily rotating sample of sold paintings"
    >
        <div class="sold-marquee__viewport">
            <div
                ref="track"
                class="sold-marquee__track"
                :class="{ 'sold-marquee__track--animate': isAnimating }"
                :style="trackStyle"
                data-testid="sold-paintings-marquee-track"
                @transitionend="handleTransitionEnd"
            >
                <div
                    v-for="(painting, index) in visiblePaintings"
                    :key="painting.slug"
                    class="sold-marquee__item"
                    :data-sold-painting-slug="painting.slug"
                >
                    <img
                        :src="painting.gridImage"
                        :width="painting.gridImageWidth || null"
                        :height="painting.gridImageHeight || null"
                        alt=""
                        loading="eager"
                        :fetchpriority="index < priorityImageCount ? 'high' : 'low'"
                        decoding="async"
                        draggable="false"
                    >
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { dailyRandomSelection } from '~/libs/daily-random'

const DAILY_SOLD_PAINTING_COUNT = 100
const DEFAULT_VISIBLE_TILE_COUNT = 14
const STEP_DURATION_MS = 1800
const START_FALLBACK_MS = 2500
const BACKGROUND_PRELOAD_DELAY_MS = 300
const RESIZE_DEBOUNCE_MS = 150

function bySlug(a, b) {
    return String(a.slug || '').localeCompare(String(b.slug || ''))
}

export default {
    name: 'SoldPaintingsMarquee',
    props: {
        paintings: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            animationReady: false,
            currentIndex: 0,
            isAnimating: false,
            stepWidth: 178,
            startTimer: null,
            resizeTimer: null,
            visibleTileCount: DEFAULT_VISIBLE_TILE_COUNT,
        }
    },
    computed: {
        eligiblePaintings() {
            return this.paintings
                .filter((painting) => painting && painting.slug && painting.gridImage)
                .slice()
                .sort(bySlug)
        },
        selectedPaintings() {
            return dailyRandomSelection(
                this.eligiblePaintings,
                DAILY_SOLD_PAINTING_COUNT,
                ['home-sold-paintings-marquee']
            )
        },
        visiblePaintings() {
            if (!this.selectedPaintings.length) {
                return []
            }

            const count = Math.min(this.visibleTileCount, this.selectedPaintings.length)
            return Array.from({ length: count }, (_, index) => {
                const paintingIndex = (this.currentIndex + index) % this.selectedPaintings.length
                return this.selectedPaintings[paintingIndex]
            })
        },
        priorityImageCount() {
            return Math.min(6, this.visiblePaintings.length)
        },
        trackStyle() {
            return {
                '--sold-marquee-duration': `${STEP_DURATION_MS}ms`,
                '--sold-marquee-step': `${this.stepWidth}px`,
            }
        },
    },
    mounted() {
        this.$nextTick(this.initializeMarquee)
    },
    beforeDestroy() {
        window.clearTimeout(this.startTimer)
        window.clearTimeout(this.resizeTimer)
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        initializeMarquee() {
            this.updateMeasurements()
            window.addEventListener('resize', this.handleResize)

            this.preloadPaintingImages(this.visiblePaintings).then(this.startAnimation)
            this.startTimer = window.setTimeout(this.startAnimation, START_FALLBACK_MS)
            window.setTimeout(() => {
                this.preloadPaintingImages(this.selectedPaintings)
            }, BACKGROUND_PRELOAD_DELAY_MS)
        },
        updateMeasurements() {
            if (!this.$refs.root || !this.$refs.track) {
                return
            }

            const viewport = this.$refs.root.querySelector('.sold-marquee__viewport')
            const item = this.$refs.root.querySelector('.sold-marquee__item')

            if (!viewport || !item) {
                return
            }

            const trackStyles = window.getComputedStyle(this.$refs.track)
            const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0
            const itemWidth = item.getBoundingClientRect().width

            this.stepWidth = Math.max(1, itemWidth + gap)
            this.visibleTileCount = Math.min(
                this.selectedPaintings.length,
                Math.ceil(viewport.getBoundingClientRect().width / this.stepWidth) + 4
            )
        },
        handleResize() {
            window.clearTimeout(this.resizeTimer)
            this.resizeTimer = window.setTimeout(() => {
                this.isAnimating = false
                this.$nextTick(() => {
                    this.updateMeasurements()
                    if (this.animationReady) {
                        this.queueAnimation()
                    }
                })
            }, RESIZE_DEBOUNCE_MS)
        },
        startAnimation() {
            if (this.animationReady || !this.selectedPaintings.length) {
                return
            }

            window.clearTimeout(this.startTimer)
            this.animationReady = true
            this.queueAnimation()
        },
        queueAnimation() {
            if (!this.animationReady || !this.selectedPaintings.length) {
                return
            }

            this.isAnimating = false
            this.$nextTick(() => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        this.isAnimating = true
                    })
                })
            })
        },
        handleTransitionEnd(event) {
            if (event.propertyName !== 'transform') {
                return
            }

            this.isAnimating = false
            this.currentIndex = (this.currentIndex + 1) % this.selectedPaintings.length
            this.$nextTick(this.queueAnimation)
        },
        preloadPaintingImages(paintings) {
            const urls = [...new Set(paintings.map((painting) => painting.gridImage).filter(Boolean))]

            return Promise.all(urls.map(this.preloadImage)).then(() => {})
        },
        preloadImage(url) {
            return new Promise((resolve) => {
                const image = new Image()
                image.onload = resolve
                image.onerror = resolve
                image.src = url
            })
        },
    },
}
</script>

<style scoped>
.sold-marquee {
    margin: 0 auto;
    max-width: 100%;
}

.sold-marquee__viewport {
    overflow: hidden;
    position: relative;
    width: 100%;
    background: #222;
}

.sold-marquee__viewport::before,
.sold-marquee__viewport::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    width: 34px;
    pointer-events: none;
}

.sold-marquee__viewport::before {
    left: 0;
    background: linear-gradient(90deg, #222 0%, rgba(34, 34, 34, 0) 100%);
}

.sold-marquee__viewport::after {
    right: 0;
    background: linear-gradient(270deg, #222 0%, rgba(34, 34, 34, 0) 100%);
}

.sold-marquee__track {
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    transform: translate3d(0, 0, 0);
}

.sold-marquee--ready .sold-marquee__track--animate {
    transition: transform var(--sold-marquee-duration, 1800ms) linear;
    transform: translate3d(calc(var(--sold-marquee-step, 178px) * -1), 0, 0);
}

.sold-marquee__item {
    flex: 0 0 clamp(96px, 28vw, 170px);
    height: clamp(76px, 19vw, 118px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #222;
}

.sold-marquee__item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
}

@media screen and (min-width: 700px) {
    .sold-marquee__viewport::before,
    .sold-marquee__viewport::after {
        width: 54px;
    }

    .sold-marquee__item {
        flex-basis: 160px;
        height: 112px;
    }
}

@media screen and (min-width: 1000px) {
    .sold-marquee__item {
        flex-basis: 170px;
        height: 118px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .sold-marquee__viewport {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .sold-marquee__track {
        transition: none;
        transform: translate3d(0, 0, 0);
        padding-bottom: 6px;
    }
}
</style>
