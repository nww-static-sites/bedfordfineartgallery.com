<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header" style="padding-bottom: 0px">
                    <h1>
                        <span class="artistTitle">{{ nameWithTinyDescription }}</span>
                    </h1>
                    <span v-if="artist.alias" class="alias">(&nbsp;&nbsp;aka&nbsp;&nbsp;{{ artist.alias
                    }}&nbsp;&nbsp;)</span>
                </div>
            </section>
        </div>

        <div class="container bio-secondary">
            <section class="wrapper clearfix">
                <h2 style="color: #f9f9f2; font-size: 22px; text-align: center; line-height: 28px">
                    Gallery of {{ artist.name }} Paintings:
                </h2>

                <p class="reverse" style="padding-top: 5px">
                    Please click photos for a COMPLETE image and description.
                </p>
                <ul class="productGrid2" style="text-align: center">
                    <li v-for="(painting, index) in filteredPaintings" :key="index">
                        <div v-if="isSoldOrHold(painting)" class="sold">
                            <span class="soldTag">{{ soldOrHoldText(painting) }}</span>
                            <nuxt-link :to="`/${painting.replace('-html', '.html')}`"><nuxt-img provider="cloudinary"
                                    :src="getGridImage(artist.paintingToObj[painting].gridImage)"
                                    :alt="nameWithTinyDescription" />
                            </nuxt-link>
                        </div>
                        <template v-else>
                            <nuxt-link :to="`/${painting.replace('-html', '.html')}`"><nuxt-img provider="cloudinary"
                                    :src="getGridImage(artist.paintingToObj[painting].gridImage)"
                                    :alt="nameWithTinyDescription" />
                            </nuxt-link>
                        </template>
                    </li>
                </ul>
            </section>
        </div>

        <div class="container primary">
            <section class="wrapper clearfix">
                <p class="bio_full" style="max-width: 860px; margin: auto; line-height: 28px">
                    {{ artist.body }}
                    <span style="
                            font-weight: bold;
                            max-width: 860px;
                            margin: auto;
                            line-height: 28px;
                            padding-top: 16px;
                            display: block;
                        ">In addition to offering the artwork below for sale, Bedford Fine Art Gallery is also actively
                        seeking to purchase artwork by {{ artist.name }}.
                        <nuxt-link style="
                                background-color: #dfddbb;
                                color: #282828;
                                padding: 2px 8px;
                                text-decoration: none;
                                display: inline-block;
                                border-radius: 4px;
                                margin-left: 6px;
                            " :to="{ name: 'directions' }">Contact Us</nuxt-link></span>
                </p>

                <span class="more bio_mobile" style="max-width: 860px; margin: auto; line-height: 28px">
                    {{ mobileBio }}
                    &nbsp;&nbsp;<span class="morelink" @click="showFullMobileBio = !showFullMobileBio">{{
                        showFullMobileBio ? 'Less' : 'More'
                    }}</span>
                </span>
                <p class="bio_mobile"
                    style="font-weight: bold; max-width: 860px; margin: auto; line-height: 28px; padding-top: 16px">
                    In addition to offering the artwork below for sale, Bedford Fine Art Gallery is also actively
                    seeking to purchase artwork by {{ artist.name }}.
                    <nuxt-link style="
                            background-color: #dfddbb;
                            color: #282828;
                            padding: 2px 8px;
                            text-decoration: none;
                            display: inline-block;
                            border-radius: 4px;
                            margin-left: 6px;
                        " :to="{ name: 'directions' }">Contact Us</nuxt-link>
                </p>
            </section>
        </div>
    </div>
</template>

<script>
import { urlSlugToSlug } from '~/libs/slug'
import { loadPaintings } from '~/libs/paintings'
import { getPostPreview } from '~/libs/post'
import { getMetaTitleAndDescriptionAndKeywords } from '~/libs/meta'

export default {
    async asyncData({ $content, route }) {
        const artist = await $content('artists', urlSlugToSlug(route.path)).fetch()
        artist.paintingToObj = await loadPaintings({
            $content,
            paintingSlugs: artist.paintings,
            columns: ['slug', 'gridImage', 'status'],
        })
        return { artist }
    },
    data() {
        return {
            showFullMobileBio: false,
        }
    },
    computed: {
        filteredPaintings() {
            return this.artist.paintings.filter((painting) => this.artist.paintingToObj[painting])
        },
        nameWithTinyDescription() {
            let nameWithTinyDescription = this.artist.name
            if (this.artist.tinyDescription) {
                nameWithTinyDescription += ` (${this.artist.tinyDescription})`
            }

            return nameWithTinyDescription
        },
        mobileBio() {
            return this.showFullMobileBio ? this.artist.body : getPostPreview(this.artist.body)
        },
    },
    methods: {
        isSoldOrHold(painting) {
            return ['Sold', 'Hold', "Jerry's Pick", "Joan's Pick"].includes(this.artist.paintingToObj[painting].status)
        },
        soldOrHoldText(painting) {
            return this.artist.paintingToObj[painting].status.toLowerCase()
        },
        getGridImage(image) {
            return image.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
    },
    head() {
        const { title, description, keywords } = getMetaTitleAndDescriptionAndKeywords({
            content: this.artist,
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
.bio_full {
    display: none;
}

.bio_mobile {
    display: block;
}

@media screen and (min-width: 600px) {
    .bio_full {
        display: block;
    }

    .bio_mobile {
        display: none;
    }
}

.morecontent span {
    display: none;
}

.morelink {
    display: inline-block;
    font-weight: bold;
    color: #333333;
    text-decoration: none;
    border-bottom: 1px solid #222222;
    cursor: pointer;
}

.bio-secondary {
    background-image: url('~assets/images/black_back.png');
    background-repeat: repeat;
}
</style>
