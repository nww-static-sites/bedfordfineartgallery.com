<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Art Blog Posts</h1>
                    <span class="hr"></span>
                </div>

                <HighlightPreview v-for="(highlight, index) in highlights" :key="`highlight-preview-${index}`" :highlight="highlight"/>

                <nuxt-img provider="cloudinary" loading="lazy" src="/images/Top-Banner.jpg" alt="Art Lovers' Niche" style="width: 100%; height:auto; max-width:660px; margin:auto; display:block;"></nuxt-img>

                <ArtLoversNicheArticlePreview v-for="(artLoversNicheArticle, index) in artLoversNicheArticles" :key="`artlover-preview-${index}`" :art-lovers-niche-article="artLoversNicheArticle" />
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
import ArtLoversNicheArticlePreview from '~/components/ArtLoversNicheArticlePreview';
import HighlightPreview from '~/components/HighlightPreview.vue'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    components: { ArtLoversNicheArticlePreview, HighlightPreview, TestimonialsScroll },
    async asyncData({ $content }) {
        return {
            highlights: await $content("articles").sortBy('date', 'desc').fetch(),
            artLoversNicheArticles: await $content("artLoversNicheArticles").sortBy('date', 'desc').fetch(),
            testimonials: await loadShortTestimonials($content),
        };
    },
}
</script>

<router>
  {
    path: '/highlights.html'
  }
</router>
