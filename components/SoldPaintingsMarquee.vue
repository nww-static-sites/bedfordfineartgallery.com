<template>
    <section class="sold-marquee" aria-label="A daily rotating sample of sold paintings">
        <div class="sold-marquee__viewport">
            <div
                class="sold-marquee__track"
                :style="trackStyle"
                data-testid="sold-paintings-marquee-track"
            >
                <div
                    v-for="(painting, index) in marqueePaintings"
                    :key="`${painting.slug}-${index}`"
                    class="sold-marquee__item"
                    :data-sold-painting-slug="painting.slug"
                >
                    <img
                        :src="painting.gridImage"
                        :width="painting.gridImageWidth || null"
                        :height="painting.gridImageHeight || null"
                        alt=""
                        :loading="index < initialEagerImageCount ? 'eager' : 'lazy'"
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
        marqueePaintings() {
            return [...this.selectedPaintings, ...this.selectedPaintings]
        },
        initialEagerImageCount() {
            return Math.min(8, this.selectedPaintings.length)
        },
        trackStyle() {
            return {
                '--sold-marquee-duration': `${Math.max(120, this.selectedPaintings.length * 1.6)}s`,
            }
        },
    },
}
</script>

<style scoped>
.sold-marquee {
    margin: 18px auto 10px;
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
    animation: sold-marquee-scroll var(--sold-marquee-duration, 160s) linear infinite;
    will-change: transform;
}

.sold-marquee:hover .sold-marquee__track {
    animation-play-state: paused;
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

@keyframes sold-marquee-scroll {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        transform: translate3d(-50%, 0, 0);
    }
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
        animation: none;
        padding-bottom: 6px;
    }
}
</style>
