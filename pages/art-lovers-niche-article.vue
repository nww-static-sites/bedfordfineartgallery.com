<template>
    <div style="padding-top: 1em;">
        <div class="artwork_header">
            <h1>Art Lovers' Niche - {{ date }}</h1>
            <span class="hr"></span>
        </div>

        <div style="max-width: 660px; margin: auto; padding: 20px;">
            <div style="padding-bottom: 20px">
                <p style="margin: 0px">
                    <nuxt-link to="/"
                        ><nuxt-img
                            provider="cloudinary"
                            src="/images/Top-Banner.jpg"
                            alt="Art Lovers' Niche"
                            style="width: 100%; height: auto; max-width: 660px; margin: auto; display: block"
                    /></nuxt-link>
                </p>

                <div v-interpolation v-html="artLoversNicheArticle.body"></div>
            </div>

            <p style="margin: 0px">
                <nuxt-link to="/"
                    ><nuxt-img
                        provider="cloudinary"
                        loading="lazy"
                        src="/mailers/img/notepad2.jpg"
                        style="width: 100%; height: auto; max-width: 660px; margin: auto; display: block"
                /></nuxt-link>
            </p>

            <p><nuxt-link class="readmore" to="highlights.html">Back to Art Blog</nuxt-link></p>
        </div>
    </div>
</template>

<script>
import { urlSlugToSlug } from '~/libs/slug'
import { formatDateNoTime } from '~/libs/format-date'
import { getMetaTitleAndDescriptionAndKeywords } from '~/libs/meta'

export default {
    async asyncData({ $content, route }) {
        const artLoversNicheArticle = await $content('artLoversNicheArticles', urlSlugToSlug(route.path)).fetch()
        return { artLoversNicheArticle }
    },
    computed: {
        date() {
            return formatDateNoTime(this.artLoversNicheArticle.date)
        },
    },
    head() {
        const { title, description, keywords } = getMetaTitleAndDescriptionAndKeywords({
            content: this.artLoversNicheArticle,
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
