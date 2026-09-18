<template>
    <div class="niche-preview" :class="{ 'niche-preview-with-image': image }">
        <nuxt-link v-if="image" :to="articlePath" class="niche-preview-image">
            <img
                :src="image.src" :width="image.width" :height="image.height"
                :alt="image.alt" loading="lazy" decoding="async" />
        </nuxt-link>
        <div class="highlights_prev niche-preview-text">
            <h2 class="niche-preview-title"><nuxt-link :to="articlePath">Art Lovers' Niche - {{ date }}</nuxt-link></h2>
            <p>{{ artLoversNicheArticle.preview }}</p>
            <p><nuxt-link :to="articlePath" class="readmore">Read More</nuxt-link></p>
        </div>
    </div>
</template>

<script>
import { formatDateNoTime } from '~/libs/format-date'

export default {
    props: {
        artLoversNicheArticle: { type: Object, required: true },
    },
    computed: {
        date() { return formatDateNoTime(this.artLoversNicheArticle.date) },
        articlePath() { return this.artLoversNicheArticle.slug.replace('-html', '.html') },
        image() { return this.artLoversNicheArticle.listingImage || null },
    },
}
</script>

<style scoped>
.niche-preview { display: grid; gap: 20px; padding: 24px 0; border-bottom: 1px solid #c3c4a2; clear: both; }
.niche-preview-image { display: block; justify-self: center; align-self: start; line-height: 0; }
.niche-preview-image img { display: block; width: auto; height: auto; max-width: 220px; max-height: 180px; object-fit: contain; }
.niche-preview-text { min-width: 0; float: none; width: auto; margin: 0; }
.niche-preview-title { font-weight: 700; }
.niche-preview-title a,
.niche-preview-title a:visited,
.niche-preview-title a:hover,
.niche-preview-title a:focus,
.niche-preview-title a:active { color: inherit; font: inherit; text-decoration: none; }
.niche-preview-title a:focus-visible,
.niche-preview-image:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@media (min-width: 650px) {
    .niche-preview-with-image { grid-template-columns: 220px minmax(0, 1fr); }
}
@media (max-width: 300px) {
    .niche-preview-image img { max-width: 100%; }
}
</style>
