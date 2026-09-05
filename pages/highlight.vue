<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <p class="article-section-label">Highlights</p>
                    <h1 class="article-title">{{ highlight.title }}</h1>
                    <span class="hr"></span>
                </div>
                <div v-if="image" class="highlights_thumbnail">
                    <nuxt-img
                        v-if="image"
                        provider="bedford"
                        loading="lazy"
                        class="art_detail"
                        :src="image"
                        :alt="highlight.imageAltText || highlight.title || 'Gallery article image'"
                        style="width: 100%; height: auto; border: 1px solid #222222"
                    />
                </div>
                <div class="highlights_prev" :class="{ 'article-without-image': !image }">
					<YouTubeVideo v-if="highlight.youtubeEmbedLink" :link="highlight.youtubeEmbedLink" :alt="highlight.youtubeAltText" />
					<br v-if="highlight.youtubeEmbedLink" />

					<div class="article-body" v-interpolation v-html="$md.render(highlight.body)" />
                    <p v-if="hasAdditionalLink">
						<nuxt-link :to="highlight.additionalLink.link" class="readmore">{{ highlight.additionalLink.text }}</nuxt-link>
					</p>
                    <p><nuxt-link :to="{ name: 'highlights' }" class="readmore">Back to Blog</nuxt-link></p>
                </div>
            </section>
        </div>
        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll />
            </section>
        </div>
    </div>
</template>

<script>
import TestimonialsScroll from '~/components/TestimonialsScroll'
import YouTubeVideo from '~/components/YouTubeVideo'
import { urlSlugToSlug } from '~/libs/slug'
import { getMetaTitleAndDescriptionAndKeywords } from '~/libs/meta'

export default {
	components: { TestimonialsScroll, YouTubeVideo },
    async asyncData({ $content, route }) {
        const highlight = await $content('articles', urlSlugToSlug(route.path)).fetch()

        return { highlight }
    },
    computed: {
        image() {
            return this.highlight.image
        },
        hasAdditionalLink() {
            return this.highlight.additionalLink && this.highlight.additionalLink.text && this.highlight.additionalLink.link
        }
    },
    head() {
        const { title, description, keywords } = getMetaTitleAndDescriptionAndKeywords({
            content: this.highlight,
        })

        return {
            title,
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: description,
                },
                {
                    hid: 'keywords',
                    name: 'keywords',
                    content: keywords,
                },
            ],
        }
    },
}
</script>

<style scoped>
.article-section-label { font-size: 1.4em; text-align: center; text-transform: uppercase; line-height: 1.1; color: #732824; margin: 0; padding: 0; }
.article-title { font-size: 1.2em; color: inherit; padding: 10px 0; }
.article-body { overflow-wrap: anywhere; }
.article-body ::v-deep img { max-width: 100%; height: auto; }
.article-body ::v-deep table { max-width: 100%; }
.article-body ::v-deep pre { overflow-x: auto; }
.article-without-image { float: none; width: 100%; margin-left: 0; }
</style>
