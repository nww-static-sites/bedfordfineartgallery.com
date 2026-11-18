<template>
    <div style="padding-top: 1em;">
        <template v-if="newFormat">
            <article class="niche-article-v7">
                <p class="niche-issue-date">Art Lovers’ Niche · {{ date }}</p>
                <div v-html="newArticle"></div>
                <p class="niche-bottom"><nuxt-link class="readmore" to="/art_lovers_niche.htm">Back to Art Lover's Niche</nuxt-link></p>
            </article>
        </template>
        <template v-else>
        <div class="artwork_header">
            <h1>Art Lovers' Niche - {{ date }}</h1>
            <span class="hr"></span>
        </div>

        <div style="max-width: 660px; margin: auto; padding: 20px;">
            <div style="padding-bottom: 20px">
                <p style="margin: 0px">
                    <nuxt-link to="/"
                        ><nuxt-img
                            provider="bedford"
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
                        provider="bedford"
                        loading="lazy"
                        src="/mailers/img/notepad2.jpg"
                        style="width: 100%; height: auto; max-width: 660px; margin: auto; display: block"
                /></nuxt-link>
            </p>

            <p><nuxt-link class="readmore" to="art_lovers_niche.htm">Back to Art Lover's Niche</nuxt-link></p>
        </div>
        </template>
    </div>
</template>

<script>
import niche from '~/libs/niche-article'
import { urlSlugToSlug } from '~/libs/slug'
import { formatDateNoTime } from '~/libs/format-date'
import { getMetaTitleAndDescriptionAndKeywords } from '~/libs/meta'

export default {
    async asyncData({ $content, route }) {
        const artLoversNicheArticle = await $content('artLoversNicheArticles', urlSlugToSlug(route.path)).fetch()
        return { artLoversNicheArticle }
    },
    computed: {
        newFormat() {
            return this.artLoversNicheArticle.nicheFormat === niche.format
        },
        newArticle() {
            return niche.render(this.artLoversNicheArticle, { site: true })
        },
        date() {
            const value = this.artLoversNicheArticle.date
            if (this.newFormat) {
                return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
                    .format(new Date(value.slice(0, 10) + 'T12:00:00Z'))
            }
            return formatDateNoTime(value)
        },
    },
    head() {
        const { title, description, keywords } = getMetaTitleAndDescriptionAndKeywords({
            content: this.artLoversNicheArticle,
        })

        return {
            title: this.newFormat ? this.artLoversNicheArticle.niche.title : title,
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: this.newFormat ? this.artLoversNicheArticle.preview : description,
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


<style>
.niche-article-v7 { width: 100%; max-width: 712px; box-sizing: border-box; padding: 0 16px 24px; margin: 0 auto; }
.niche-issue-date { font-size: 15px; text-align: center; margin: 6px 0 18px; }
.niche-bottom { margin-top: 22px; }
.niche-v7 a:focus-visible { outline: 3px solid #742924; outline-offset: 3px; }
@media (max-width: 480px) {
    .niche-article-v7 { padding-inline: 10px; }
    .niche-v7 .niche-copy { padding-inline: 16px !important; }
    .niche-v7 .niche-quote { padding-inline: 20px !important; }
    .niche-v7 .niche-gallery { font-size: 20px !important; padding: 18px 16px !important; }
}
</style>
