<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Highlights</h1>
                    <h2>{{ highlight.title }}</h2>
                    <span class="hr"></span>
                </div>
                <div class="highlights_thumbnail">
                    <nuxt-img
                        provider="cloudinary"
                        loading="lazy"
                        class="art_detail"
                        :src="image"
                        alt="19th Century Fine Art Legacy"
                        style="width: 100%; height: auto; border: 1px solid #222222"
                    />
                </div>
                <div class="highlights_prev">
					<YouTubeVideo v-if="highlight.youtubeEmbedLink" :link="highlight.youtubeEmbedLink" :alt="highlight.youtubeAltText" />
					<br v-if="highlight.youtubeEmbedLink" />

					<div v-interpolation v-html="$md.render(highlight.body)" />
                    <p v-if="hasAdditionalLink">
						<nuxt-link :to="highlight.additionalLink.link" class="readmore">{{ highlight.additionalLink.text }}</nuxt-link>
					</p>
                    <p><nuxt-link :to="{ name: 'highlights' }" class="readmore">Back to Highlights</nuxt-link></p>
                </div>
            </section>
        </div>
        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll :testimonials="testimonials" />
            </section>
        </div>
    </div>
</template>

<script>
import TestimonialsScroll from '~/components/TestimonialsScroll'
import YouTubeVideo from '~/components/YouTubeVideo'
import { urlSlugToSlug } from '~/libs/slug'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
	components: { TestimonialsScroll, YouTubeVideo },
    async asyncData({ $content, route }) {
        const testimonials = await loadShortTestimonials($content)
        const highlight = await $content('articles', urlSlugToSlug(route.path)).fetch()

        return { highlight, testimonials }
    },
    computed: {
        image() {
            return this.highlight.image.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
        hasAdditionalLink() {
            return this.highlight.additionalLink && this.highlight.additionalLink.text && this.highlight.additionalLink.link
        }
    }
}
</script>