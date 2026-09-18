<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <p class="article-section-label">Art Blog</p>
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

                    <nav v-if="articleContent.headings.length" class="article-contents" aria-labelledby="article-contents-title">
                        <p id="article-contents-title" class="article-contents-title">{{ contentsTitle }}</p>
                        <ul>
                            <li v-for="section in articleContent.headings" :key="section.id">
                                <a :href="'#' + section.id">{{ section.title }}</a>
                            </li>
                        </ul>
                    </nav>
                    <div class="article-body" v-interpolation v-html="articleContent.html" />
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
import ArticleOutline from '~/libs/article-outline'

export default {
	components: { TestimonialsScroll, YouTubeVideo },
    async asyncData({ $content, route }) {
        const highlight = await $content('articles', urlSlugToSlug(route.path)).fetch()

        return { highlight }
    },
    computed: {
        articleContent() {
            return ArticleOutline.render(this.$md, this.highlight.body, this.highlight.showTableOfContents)
        },
        contentsTitle() {
            return String(this.highlight.tableOfContentsTitle || '').trim() || 'In this article'
        },
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
.article-title { font-size: 1.2em; font-weight: 700; color: inherit; padding: 10px 0; }
.article-body { overflow-wrap: anywhere; }
.article-body ::v-deep strong, .article-body ::v-deep b,
.article-body ::v-deep h1, .article-body ::v-deep h2, .article-body ::v-deep h3,
.article-body ::v-deep h4, .article-body ::v-deep h5, .article-body ::v-deep h6 { font-weight: 700; }
.article-body ::v-deep em, .article-body ::v-deep i { font-style: italic; }
.article-body ::v-deep h2[id] { scroll-margin-top: 110px; }
.article-body ::v-deep h2[id]:focus-visible { outline: 2px solid #732824; outline-offset: 4px; }
.article-contents { padding: 18px 20px; margin: 0 0 26px; border: 1px solid #d6c9b5; border-radius: 6px; background: #faf7f1; overflow-wrap: anywhere; }
.article-contents .article-contents-title { font-size: 1.1em; font-weight: 700; margin: 0 0 10px; }
.article-contents ul { list-style: none; margin: 0; padding: 0; }
.article-contents li { margin: 0 0 8px; line-height: 1.4; }
.article-contents li:last-child { margin-bottom: 0; }
.article-contents a { color: #732824; text-decoration: underline; text-underline-offset: 3px; }
.article-contents a:focus-visible { outline: 2px solid #732824; outline-offset: 3px; }
.article-body ::v-deep img { max-width: 100%; height: auto; }
.article-body ::v-deep table { max-width: 100%; }
.article-body ::v-deep pre { overflow-x: auto; }
.article-without-image { float: none; width: 100%; margin-left: 0; }
</style>
