<template>
    <div>
        <div v-if="showModal">
            <Modal
                :painting-title="painting.title"
                :artist-name-with-tiny-description="artistNameWithTinyDescription"
                :medium-res-image="painting.mediumResImage || painting.highResImage"
                @close="showModal = false"
            />
        </div>

        <div class="container primary">
            <section class="wrapper clearfix">
                <PaintingHeader :painting="painting" />

                <div class="col_40 artwork">
                    <p class="mobile_phone_cta">
                        Interested in this painting? Call
                        <a
                            href="tel:1-724-459-0612"
                            style="text-decoration: none; color: #000"
                            class="mobile_phone_cta_link"
                            >724-459-0612</a
                        >
                    </p>
                    <template v-if="isSold">
                        <div class="sold">
                            <span class="soldTag">sold</span>
                            <nuxt-picture
                                provider="cloudinary"
                                loading="lazy"
                                class="art_detail"
                                :alt="altText"
                                :src="mediumResImage"
                                :width="painting.mediumResImageWidth"
                                :height="painting.mediumResImageHeight"
                            />
                        </div>
                    </template>
                    <template v-else>
                        <div class="zoom_desktop">
                            <Zoom :mobile="false" :painting="painting" :alt="altText" />
                        </div>
                        <div class="zoom_mobile">
                            <Zoom :mobile="true" :painting="painting" :alt="altText" />
                        </div>
                        <p class="zoom">Click image to zoom</p>

                        <div v-if="painting.artOnWallImage" style="margin-top: 20px">
                            <Zoom :mobile="false" :painting="painting" :alt="altText" :use-art-on-wall-image="true" />
                        </div>
                        <p v-if="painting.artOnWallImage" class="zoom">Click image to zoom</p>
                    </template>

                    <div class="mobile_cta">
                        <div class="breadcrumb" style="margin-top: 2px; text-align: center">
                            <a
                                v-if="!isSold"
                                href="#contact_anchor"
                                style="display: inline-block; margin: 0 auto 24px auto; background-color: #2c57ac"
                                class="mo Videobile_buy_cta"
                                >Buy Painting / Contact Us</a
                            >
                        </div>
                        <ul v-if="showHighlights" class="checkmark" style="width: 100%; max-width: 350px; margin: auto">
                            <li v-for="(highlight, index) in painting.highlights" :key="index">
                                {{ highlight.highlight }}
                                <template v-if="highlight.pairedPainting">
                                    (sold as a pair with
                                    <nuxt-link :to="highlight.pairedPainting.slug.replace('-html', '.html')">{{
                                        highlight.pairedPainting.title
                                    }}</nuxt-link
                                    >)
                                </template>
                            </li>
                        </ul>
                    </div>
                    <div v-if="showArtPlacer" class="breadcrumb view_on_wall" style="margin-top: 10px">
                        <span id="artplacer2"></span>
                    </div>
                    <div v-if="showArtPlacer" class="breadcrumb view_on_wall" style="margin-top: 10px">
                        <span id="artplacer1"></span>
                    </div>

                    <div v-if="!isSold" style="width: 100%; max-width: 340px; margin: auto">
                        <p style="text-align: left; padding-bottom: 10px; padding-top: 20px; font-weight: bold">
                            Click the button above, then 3 easy steps:
                        </p>
                        <div class="list_flex">
                            <div class="list_cirlce">1</div>
                            <div>Upload a photo of your room.</div>
                        </div>
                        <div class="list_flex">
                            <div class="list_cirlce">2</div>
                            <div>Define an area in the photo.</div>
                        </div>
                        <div class="list_flex">
                            <div class="list_cirlce">3</div>
                            <div>Choose the <span style="font-weight: bold">HEIGHT OF THE AREA.</span></div>
                        </div>
                        <p style="text-decoration: underline; font-size: 13px; text-align: left">
                            <a href="how_to_view_a_painting_on_your_wall.htm" target="_blank" style="color: #5f5f5f"
                                >Full Instructions &raquo;</a
                            >
                        </p>
                    </div>
                    <div v-if="painting.artist.hasLandingPage" class="breadcrumb">
                        <nuxt-link
                            :to="`/${painting.artist.slug.replace('-html', '.html')}`"
                            style="width: 90%; margin: 0 auto 24px auto"
                            >View all Paintings from this Artist</nuxt-link
                        >
                    </div>
                    <p v-if="painting.youtubeText" class="above_video_txt">{{ painting.youtubeText }}</p>
                    <YouTubeVideo
                        v-if="painting.youtubeEmbedLink"
                        :link="painting.youtubeEmbedLink"
                        :alt="painting.youtubeAltText"
                    />
                    <!-- testimonials desktop -->
                    <div
                        class="container test_int_desktop"
                        style="padding-top: 24px; width: 90%; margin: 20px auto; background-color: rgba(16, 88, 185, 1)"
                    >
                        <section class="wrapper" style="width: 90%; max-width: 860px; margin: auto">
                            <div class="home_test">
                                <TestimonialsScroll :testimonials="testimonials" />
                            </div>
                            <!--#include virtual="testimonials_scroll.html"-->
                        </section>
                    </div>
                    <!-- end testimonials desktop -->
                    <div class="flex_wrap" style="clear: both; padding-top: 5px;">
                <div style="margin:auto;"><nuxt-img
                                provider="cloudinary"
                                src="shipping_options_ijojdq.png"
                                width="1825"
                                height="1254"
                                alt="Bedford Fine Art Gallery Shipping Options"
                                style="max-width: 800px; margin: auto;"
                        /></div>
                </div>
                </div>

                <div class="col_60 artwork_details">
                    <div class="desktop_cta">
                        <ul v-if="showHighlights" class="checkmark">
                            <li v-for="(highlight, index) in painting.highlights" :key="index">
                                {{ highlight.highlight }}
                                <template v-if="highlight.pairedPainting">
                                    (sold as a pair with
                                    <nuxt-link :to="highlight.pairedPainting.slug.replace('-html', '.html')">{{
                                        highlight.pairedPainting.title
                                    }}</nuxt-link
                                    >)
                                </template>
                            </li>
                        </ul>
                        <div class="breadcrumb" style="margin-top: 16px; text-align: left">
                            <a
                                v-if="!isSold"
                                href="#contact_anchor"
                                style="display: inline-block; margin: 0 auto 24px auto; background-color: #2c57ac"
                                >Buy Painting / Contact Us</a
                            >
                        </div>
                    </div>

                    <!-- eslint-disable vue/no-v-html -->
                    <div v-interpolation class="detail_content" v-html="$md.render(painting.body)" />
                    <!--eslint-enable-->

                    <div id="contact_anchor" class="more_info">
                        <h3 style="text-transform: none; color: #841012; font-size: 1.1em; line-height: 1.3em">
                            Call now to talk about your interest in this painting:
                            <a
                                href="tel:1-724-459-0612"
                                style="text-decoration: none; color: #841012"
                                class="mobile_phone_link"
                                >724-459-0612</a
                            ><span style="display: block; padding-top: 4px"> Jerry Hawk, Bedford Fine Art Gallery</span
                            ><span style="display: block; padding-top: 16px; padding-bottom: 16px">OR</span
                            ><span
                                style="
                                    display: block;
                                    color: #841012;
                                    max-width: 450px;
                                    margin: auto;
                                    line-height: 24px;
                                "
                                >We don't know which of your own thoughts will convince yourself that a great decision
                                is going to be made. Only you can find yourself doing so because it naturally and easily
                                makes sense and feels right for you. So please feel free to ask any questions that allow
                                you to recognize that is happening.</span
                            >
                        </h3>

                        <ContactForm
                            form-name="Painting"
                            form-type="desktop"
                            :painting-title="painting.title"
                            :artist-name-with-tiny-description="artistNameWithTinyDescription"
                        />
                        <ContactForm
                            form-name="Painting"
                            form-type="mobile"
                            :painting-title="painting.title"
                            :artist-name-with-tiny-description="artistNameWithTinyDescription"
                        />
                    </div>
                </div>
                <div class="breadcrumb"><nuxt-link :to="{ name: 'artists-bios' }">Back to Gallery</nuxt-link></div>
            </section>
        </div>
    </div>
</template>

<script>
import { artistNameWithTinyDescription } from '~/libs/artist'
import ContactForm from '~/components/ContactForm'
import PaintingHeader from '~/components/PaintingHeader'
import PaintingVisitsMixin from '~/mixins/PaintingVisitsMixin'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import YouTubeVideo from '~/components/YouTubeVideo'
import Zoom from '~/components/Zoom'
import { urlSlugToSlug } from '~/libs/slug'
import { loadShortTestimonials } from '~/libs/testimonials'
import { getMetaTitleAndDescriptionAndKeywords } from '~/libs/meta'

export default {
    components: { ContactForm, PaintingHeader, TestimonialsScroll, YouTubeVideo, Zoom },
    mixins: [PaintingVisitsMixin],
    async asyncData({ $content, route }) {
        const testimonials = await loadShortTestimonials($content)
        const painting = await $content('paintings', urlSlugToSlug(route.path)).fetch()
        painting.highlights = painting.highlights || []

        for (let i = 0; i < painting.highlights.length; i++) {
            if (painting.highlights[i].pairedPainting) {
                const pairedPainting = await $content('paintings', painting.highlights[i].pairedPainting).only(['title']).fetch()
                painting.highlights[i].pairedPainting = {
                    slug: painting.highlights[i].pairedPainting,
                    title: pairedPainting.title,
                }
            }
        }

        painting.artist = await $content('artists', painting.artist).only(['name', 'tinyDescription', 'slug', 'alias', 'hasLandingPage']).fetch()

        return { painting, testimonials }
    },
    computed: {
        artistNameWithTinyDescription() {
            return artistNameWithTinyDescription(this.painting.artist)
        },
        isSold() {
            return this.painting.status === 'Sold'
        },
        artworkUrl() {
            return this.painting.highResImage
        },
        showArtPlacer() {
            return (
                this.painting.status !== 'Sold' &&
                (!this.painting.categories || !this.painting.categories.includes('Sculpture'))
            )
        },
        artplacerSize() {
            return this.showArtPlacer ? `${this.painting.paintingWidth} x ${this.painting.paintingHeight}` : ''
        },
        artplacerHeight() {
            return this.showArtPlacer ? this.painting.paintingHeight : ''
        },
        showHighlights() {
            return this.painting.highlights && this.painting.highlights.length > 0 && !this.sold
        },
        mediumResImage() {
            return this.painting.mediumResImage.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
        altText() {
            return this.painting.mainImageAltText || artistNameWithTinyDescription(this.painting.artist)
        },
    },
    mounted() {
        window.__nww__artplacerplaced = false
        const $this = this
        this.$nextTick(function () {
            $this.maybeLoadArtPlacerScript()
        })
    },
    updated() {
        this.maybeLoadArtPlacerScript()
    },
    methods: {
        maybeLoadArtPlacerScript() {
            if (!window.__nww__artplacerplaced) {
                const script = document.createElement('script')
                script.onload = this.onScriptLoaded
                script.type = 'text/javascript'
                script.src = '//widget.artplacer.com/js/script.js'
                document.head.appendChild(script)
            }
        },
        onScriptLoaded() {
            if (this.showArtPlacer && !window.__nww__artplacerplaced) {
                window.__nww__artplacerplaced = true
                window.ArtPlacer.insert({
                    gallery: '3188',
                    type: '1',
                    text: 'VIEW THIS PAINTING ON YOUR WALL',
                    artwork_url: this.artworkUrl,
                    frames: false,
                    catalog: false,
                    height: this.artplacerHeight,
                    size: this.artplacerSize,
                    after: '#artplacer1',
                })
                window.ArtPlacer.insert({
                    gallery: '3188',
                    space: '14392',
                    type: '2',
                    text: 'VIEW THIS PAINTING ON A WALL',
                    artwork_url: this.artworkUrl,
                    frames: false,
                    catalog: false,
                    height: this.artplacerHeight,
                    size: this.artplacerSize,
                    after: '#artplacer2',
                })
            }
        },
    },
    head() {
        const { title, description, keywords } = getMetaTitleAndDescriptionAndKeywords({
            content: this.painting,
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
.artwork img {
    width: 90% !important;
    height: auto;
}
</style>
