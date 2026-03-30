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
import HighlightPreview from '~/components/HighlightPreview.vue'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    components: { HighlightPreview, TestimonialsScroll },
    async asyncData({ $content }) {
        return {
            highlights: await $content('articles').sortBy('date', 'desc').fetch(),
            testimonials: await loadShortTestimonials($content),
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
