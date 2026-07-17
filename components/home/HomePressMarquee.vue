<template>
    <section class="bfa-press" aria-label="Publications featuring Bedford Fine Art Gallery">
        <p class="bfa-press__label">As Seen In</p>
        <div class="bfa-press__viewport">
            <div class="bfa-press__track">
                <div v-for="group in 2" :key="group" class="bfa-press__group" :aria-hidden="group === 2 ? 'true' : null">
                    <component
                        :is="publication.href ? 'a' : 'span'"
                        v-for="publication in publications"
                        :key="`${group}-${publication.name}`"
                        class="bfa-press__item"
                        :href="publication.href || null"
                        :target="publication.href ? '_blank' : null"
                        :rel="publication.href ? 'noopener noreferrer' : null"
                        :tabindex="group === 2 && publication.href ? -1 : null"
                    >
                        {{ publication.name }}
                    </component>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'HomePressMarquee',
    data() {
        return {
            publications: [
                { name: 'American Art Review' },
                {
                    name: 'Pittsburgh Quarterly',
                    href: 'https://pittsburghquarterly.com/articles/the-business-of-art-fall-2015/',
                },
                { name: 'Carnegie Magazine' },
                { name: 'Johnstown Magazine' },
                { name: 'Elan Magazine' },
                { name: 'Allegheny Magazine' },
                {
                    name: 'Bedford Gazette',
                    href: 'https://www.bedfordgazette.com/news/local/bedford-fine-art-gallery/article_0a815ab0-f4b9-5d06-bacf-b3471c94a451.html',
                },
                {
                    name: 'New York Times',
                    href: 'https://www.nytimes.com/2023/11/12/style/auguste-toulmouche-hesitant-fiancee-tiktok.html',
                },
            ],
        }
    },
}
</script>

<style scoped>
.bfa-press {
    background: #d2d2c8;
    box-sizing: border-box;
    color: #4f4f4f;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    overflow: hidden;
    padding: 10px 0 13px;
    width: 100vw;
}

.bfa-press__label {
    font-size: 14px;
    line-height: 1.25;
    margin: 0 0 6px;
    text-align: center;
}

.bfa-press__viewport {
    overflow: hidden;
    width: 100%;
}

.bfa-press__track {
    animation: bfa-press-scroll 65s linear infinite;
    display: flex;
    width: max-content;
}

.bfa-press__group {
    display: flex;
    flex-shrink: 0;
    gap: 58px;
    padding-right: 58px;
}

.bfa-press__item {
    color: #4f4f4f;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.35;
    text-decoration: none;
    white-space: nowrap;
}

.bfa-press__item:hover,
.bfa-press__item:focus-visible {
    color: #742924;
    text-decoration: underline;
    text-underline-offset: 3px;
}

.bfa-press:hover .bfa-press__track,
.bfa-press:focus-within .bfa-press__track {
    animation-play-state: paused;
}

@keyframes bfa-press-scroll {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        transform: translate3d(-50%, 0, 0);
    }
}

@media screen and (max-width: 767px) {
    .bfa-press {
        padding: 9px 0 11px;
    }

    .bfa-press__group {
        gap: 34px;
        padding-right: 34px;
    }

    .bfa-press__item {
        font-size: 18px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bfa-press__viewport {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .bfa-press__track {
        animation: none;
    }

    .bfa-press__group:nth-child(2) {
        display: none;
    }
}
</style>
