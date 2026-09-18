<template>
    <div>
        <div v-if="highlight.gridImage" class="highlights_thumbnail">
            <nuxt-link :to="highlight.slug.replace('-html', '.html')"
                ><nuxt-img
                    provider="bedford"
                    loading="lazy"
                    :src="highlight.gridImage"
                    :alt="highlight.gridImageAltText || highlight.title || 'Gallery article image'"
                    style="width: 100%; height: auto; border: 1px solid #222222"
            /></nuxt-link>
        </div>
        <div class="highlights_prev" :class="{ 'article-without-image': !highlight.gridImage }">
            <h2 class="article-preview-title">
                <nuxt-link :to="highlight.slug.replace('-html', '.html')">{{ highlight.title }}</nuxt-link>
            </h2>
            <p>
				{{ highlight.preview }}
            </p>

            <p><nuxt-link :to="highlight.slug.replace('-html', '.html')" class="readmore">Read More</nuxt-link></p>
        </div>

        <span
            style="height: 1px; width: 100%; display: block; clear: both; background: #c3c4a2; margin-bottom: 1.5em"
        ></span>
    </div>
</template>

<script>
export default {
	props: {
		highlight: {
			type: Object,
			required: true,
		}
	},
}
</script>

<style scoped>
.article-preview-title { font-weight: 700; }
.article-preview-title a,
.article-preview-title a:visited,
.article-preview-title a:hover,
.article-preview-title a:focus,
.article-preview-title a:active { color: inherit; font: inherit; text-decoration: none; }
.article-preview-title a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.article-without-image { float: none; width: 100%; margin-left: 0; }
</style>
