<template>
    <div
        class="bfa-marquee"
        :class="`bfa-marquee--${variant}`"
        :style="marqueeStyle"
        :aria-label="decorative ? null : label"
        :aria-hidden="decorative ? 'true' : null"
    >
        <div class="bfa-marquee__track">
            <div v-for="group in 2" :key="group" class="bfa-marquee__group" :aria-hidden="group === 2 ? 'true' : null">
                <component
                    :is="image.href ? 'a' : 'span'"
                    v-for="(image, index) in images"
                    :key="`${group}-${image.src}-${index}`"
                    class="bfa-marquee__item"
                    :href="image.href || null"
                    :tabindex="group === 2 && image.href ? -1 : null"
                >
                    <img
                        :src="image.src"
                        :alt="decorative ? '' : (image.alt || '')"
                        :width="image.width || 290"
                        :height="image.height || 200"
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                    >
                </component>
            </div>
        </div>
    </div>
</template>

<script>
const GAP_WIDTH = 10
const DESKTOP_PIXELS_PER_SECOND = 17
const MOBILE_PIXELS_PER_SECOND = 19
const ITEM_WIDTHS = {
    artwork: {
        desktop: 176,
        mobile: 148,
    },
    customers: {
        desktop: 196,
        mobile: 174,
    },
}

export default {
    name: 'HomeImageMarquee',
    props: {
        images: {
            type: Array,
            required: true,
        },
        label: {
            type: String,
            default: 'Scrolling images',
        },
        variant: {
            type: String,
            default: 'artwork',
        },
        decorative: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        marqueeStyle() {
            const itemCount = Math.max(this.images.length, 1)
            const itemWidths = ITEM_WIDTHS[this.variant] || ITEM_WIDTHS.artwork
            const desktopDuration = (itemCount * (itemWidths.desktop + GAP_WIDTH)) / DESKTOP_PIXELS_PER_SECOND
            const mobileDuration = (itemCount * (itemWidths.mobile + GAP_WIDTH)) / MOBILE_PIXELS_PER_SECOND

            return {
                '--bfa-marquee-duration': `${desktopDuration.toFixed(2)}s`,
                '--bfa-marquee-mobile-duration': `${mobileDuration.toFixed(2)}s`,
            }
        },
    },
}
</script>

<style scoped>
.bfa-marquee {
    overflow: hidden;
    width: 100%;
}

.bfa-marquee__track {
    animation: bfa-marquee-scroll var(--bfa-marquee-duration, 110s) linear infinite;
    display: flex;
    will-change: transform;
    width: max-content;
}

.bfa-marquee__group {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    padding-right: 10px;
}

.bfa-marquee__item {
    display: block;
    flex: 0 0 auto;
    height: 120px;
    overflow: hidden;
    text-decoration: none;
    width: 176px;
}

.bfa-marquee--customers .bfa-marquee__item {
    border-radius: 12px;
    height: 135px;
    width: 196px;
}

.bfa-marquee__item img {
    border-radius: 8px;
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
}

.bfa-marquee--artwork .bfa-marquee__item img {
    border-radius: 0;
    object-fit: cover;
}

.bfa-marquee--customers .bfa-marquee__item img {
    border-radius: 12px;
}

@keyframes bfa-marquee-scroll {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        transform: translate3d(-50%, 0, 0);
    }
}

@media screen and (max-width: 767px) {
    .bfa-marquee__track {
        animation-duration: var(--bfa-marquee-mobile-duration, 82s);
    }

    .bfa-marquee__item {
        height: 100px;
        width: 148px;
    }

    .bfa-marquee--customers .bfa-marquee__item {
        height: 120px;
        width: 174px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bfa-marquee {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .bfa-marquee__track {
        animation: none;
    }

    .bfa-marquee__group:nth-child(2) {
        display: none;
    }
}
</style>
