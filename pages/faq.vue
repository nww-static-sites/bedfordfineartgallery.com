<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header"><h1>FAQs</h1><span class="hr"></span></div>
                <template v-for="(faq, index) in faqs">
                    <div v-if="faq.image" :key="faq.slug + '-image'" class="highlights_thumbnail">
                        <img class="art_detail_img" loading="lazy" :src="faq.image"
                            :width="faq.imageWidth || 392" :height="faq.imageHeight || 260" :alt="faq.imageAltText" />
                    </div>
                    <div :key="faq.slug" class="highlights_prev" :class="{ 'faq-without-image': !faq.image }">
                        <h2>{{ faq.question }}</h2>
                        <div class="faq-answer" v-html="faq.answerHtml" />
                        <div v-if="faq.more" :id="'faq-more-' + faq.slug" class="faq-answer" v-show="expanded[faq.slug]" v-html="faq.moreHtml" />
                        <button v-if="faq.more" class="btn btn-success" type="button"
                            :aria-expanded="expanded[faq.slug] ? 'true' : 'false'" :aria-controls="'faq-more-' + faq.slug"
                            :aria-label="(expanded[faq.slug] ? 'Read Less: ' : 'Read More: ') + faq.question"
                            @click="$set(expanded, faq.slug, !expanded[faq.slug])">{{ expanded[faq.slug] ? 'Read Less' : 'Read More' }}</button>
                    </div>
                    <span v-if="index < faqs.length - 1" :key="faq.slug + '-separator'" class="faq-separator"></span>
                </template>
            </section>
        </div>
        <div class="container footer_test" style="padding-top:24px;width:100%;margin:0 auto;background-color:rgba(16,88,185,1)">
            <section class="wrapper" style="max-width:860px;margin:auto"><TestimonialsScroll /></section>
        </div>
    </div>
</template>

<script>
import TestimonialsScroll from '~/components/TestimonialsScroll'
import { renderFaq, sortFaqs } from '~/libs/faq'

export default {
    components: { TestimonialsScroll },
    async asyncData({ $content }) {
        const records = await $content('faqs').fetch()
        return { faqs: sortFaqs(records).map(faq => ({
            ...faq, answerHtml: renderFaq(faq.answer), moreHtml: renderFaq(faq.more || ''),
        })) }
    },
    data() { return { expanded: {} } },
}
</script>

<style scoped>
.highlights_thumbnail { clear: both; }
.faq-without-image { width:100%;float:none; }
.faq-separator { height:1px;width:100%;display:block;clear:both;background:#c3c4a2;margin-bottom:1em;margin-top:1.5em; }
.faq-answer ::v-deep p { margin-top:0; }
</style>

<router>{ "path": "/faq.html" }</router>
