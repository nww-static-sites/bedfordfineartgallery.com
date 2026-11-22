<template>
    <div>
         <div class="btn-container">
            <a href="highlights.html" class="btn">Art Blog</a>
            <a href="art_lovers_niche.htm" class="btn btn_active">Art Lovers' Niche</a>
        </div>

        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Art Blog Posts</h1>
                    <span class="hr"></span>
                </div>

                <HighlightPreview
                    v-for="(highlight, index) in highlights"
                    :key="`highlight-preview-${index}`"
                    :highlight="highlight"
                />
                <BlogActions />
            </section>
        </div>
        <TestimonialsScroll />
    </div>
</template>

<script>
import HighlightPreview from '~/components/HighlightPreview.vue'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import BlogActions from '~/components/BlogActions.vue'
import { getPostPreview } from '~/libs/post'
import { compareArticles } from '~/libs/article-order'

export default {
    head() {
        return {
            title: "Fine Art Blog | Painting Stories and Collector Guides | Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Read Bedford Fine Art Gallery’s articles on artists, paintings and art collecting. Browse profiles, artwork stories and practical advice for living with fine art." }],
        }
    },
    components: { HighlightPreview, TestimonialsScroll, BlogActions },
    async asyncData({ $content }) {
        const highlights = await $content('articles')
            .only(['slug', 'date', 'title', 'gridImage', 'gridImageAltText', 'body'])
            .fetch()

        return {
            highlights: highlights.sort(compareArticles).map(({ slug, date, title, gridImage, gridImageAltText, body }) => ({
                slug,
                date,
                title,
                gridImage,
                gridImageAltText,
                preview: getPostPreview(body),
            })),
        }
    },
}
</script>
<style scoped>
.btn-container {
    max-width: 660px;
    margin: 20px auto 0px auto;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.btn {
    background-color: #681d1e;
    color: #f2f2f2;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    display: inline-block;
    transition: opacity 0.2s ease;
}
.btn_active {
    background-color: transparent;
    border: 1px solid #681d1e;
    color: #681d1e;
}

.btn:hover {
    opacity: 0.85;
}

/* Mobile stacking */
@media (max-width: 480px) {
    .btn-container {
        flex-direction: column;
        align-items: center;
    }
    .btn {
        width: 100%;
        text-align: center;
    }
}
</style>

<router>
  {
    path: '/highlights.html'
  }
</router>
