<template>
    <div>
        <div v-if="loading" class="container secondary ipad_status">
            <p>Loading gallery…</p>
        </div>

        <div v-else-if="loadError" class="container primary ipad_status">
            <p>{{ loadError }}</p>
            <button type="button" class="ipad_retry" @click="loadPaintings">Try Again</button>
        </div>

        <div v-else-if="isGallery" class="container secondary">
            <section class="wrapper clearfix">
                <ul class="productGrid2">
                    <li v-for="galleryPainting in galleryPaintings" :key="galleryPainting.slug">
                        <nuxt-link :to="galleryPainting.ipadPath">
                            <nuxt-picture
                                class="ipad_gallery_image"
                                provider="bedford"
                                :src="getPaintingImage(galleryPainting)"
                                :alt="artistNameWithTinyDescription(galleryPainting.artist)"
                            />
                            <p class="artist_gallery_title">{{ artistNameWithTinyDescription(galleryPainting.artist) }}</p>
                        </nuxt-link>
                    </li>
                </ul>
            </section>
        </div>

        <div v-else-if="painting" class="container primary">
            <section class="wrapper clearfix artist_title_container">
                <PaintingHeader :painting="painting" />

                <div class="col_40 artwork">
                    <Zoom :mobile="false" :painting="painting" :alt="altText" />
                    <p class="zoom">Click image to zoom</p>
                </div>

                <div class="col_60 artwork_details">
                    <template v-if="painting.youtubeEmbedLink">
                        <YouTubeVideo :link="painting.youtubeEmbedLink" />
                    </template>
                    <template v-else>
                        <!-- eslint-disable vue/no-v-html -->
                        <div v-interpolation class="artist_bio detail_content" v-html="$md.render(painting.body || '')" />
                        <!--eslint-enable-->
                    </template>
                </div>

                <div
                    v-if="painting.youtubeEmbedLink"
                    v-interpolation
                    class="artist_bio detail_content"
                    v-html="$md.render(painting.body || '')"
                />
                <!--eslint-enable-->

                <div class="breadcrumb"><nuxt-link to="/ipad">Back to Gallery</nuxt-link></div>
            </section>
        </div>

        <div v-else class="container primary ipad_status">
            <p>This painting is not available.</p>
            <nuxt-link class="ipad_retry" to="/ipad">Back to Gallery</nuxt-link>
        </div>
    </div>
</template>

<script>
import { artistNameWithTinyDescription } from '~/libs/artist'
import PaintingHeader from '~/components/PaintingHeader'
import YouTubeVideo from '~/components/YouTubeVideo'
import Zoom from '~/components/Zoom'

let sharedPaintingsPromise

async function loadSharedPaintings() {
    if (!sharedPaintingsPromise) {
        sharedPaintingsPromise = (async () => {
            const manifestResponse = await fetch('/data/ipad-paintings-manifest.json', { cache: 'no-cache' })
            if (!manifestResponse.ok) {
                throw new Error(`manifest request returned ${manifestResponse.status}`)
            }

            const manifest = await manifestResponse.json()
            const dataResponse = await fetch(manifest.file)
            if (!dataResponse.ok) {
                throw new Error(`painting data request returned ${dataResponse.status}`)
            }

            const data = await dataResponse.json()
            if (!Array.isArray(data.paintings) || data.paintings.length !== manifest.paintingCount) {
                throw new Error('painting data did not match its manifest')
            }

            return data.paintings
        })()
    }

    try {
        return await sharedPaintingsPromise
    } catch (error) {
        sharedPaintingsPromise = null
        throw error
    }
}

export default {
    components: { PaintingHeader, YouTubeVideo, Zoom },
    layout: 'ipad',
    data() {
        return {
            loading: true,
            loadError: '',
            paintings: [],
        }
    },
    computed: {
        currentPath() {
            return decodeURIComponent(this.$route.path).replace(/\/$/, '') || '/ipad'
        },
        isGallery() {
            return ['/ipad', '/ipad.html'].includes(this.currentPath)
        },
        paintingByPath() {
            return this.paintings.reduce((byPath, painting) => {
                byPath[painting.ipadPath] = painting
                if (painting.ipadPath.endsWith('.html')) {
                    byPath[painting.ipadPath.slice(0, -5)] = painting
                } else {
                    byPath[`${painting.ipadPath}.html`] = painting
                }
                return byPath
            }, {})
        },
        painting() {
            return this.paintingByPath[this.currentPath] || null
        },
        galleryPaintings() {
            return this.paintings
                .filter((painting) => painting.status !== 'Sold')
                .slice()
                .sort((a, b) => {
                    const artistA = (a.artist.name || '').split(' ').pop().toLowerCase()
                    const artistB = (b.artist.name || '').split(' ').pop().toLowerCase()
                    return artistA.localeCompare(artistB)
                })
        },
        altText() {
            if (!this.painting) {
                return ''
            }
            return this.painting.mainImageAltText || artistNameWithTinyDescription(this.painting.artist)
        },
    },
    mounted() {
        this.loadPaintings()
    },
    methods: {
        artistNameWithTinyDescription,
        getPaintingImage(painting) {
            return painting.gridImage || painting.mediumResImage || ''
        },
        async loadPaintings() {
            this.loading = true
            this.loadError = ''

            try {
                this.paintings = await loadSharedPaintings()
            } catch (error) {
                console.error('Unable to load the iPad gallery.', error)
                this.loadError = 'The gallery could not be loaded. Please check the connection and try again.'
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
.secondary {
    background-color: #222;
}
.compliment {
    display: none;
}
.breadcrumb {
    clear: both;
    text-align: center;
    position: absolute;
    top: 10px;
    left: 10px;
}
.breadcrumb a,
.ipad_retry {
    border: none;
    background-color: #742924;
    padding: 8px 12px;
    color: #f9f9f2;
    text-transform: uppercase;
    font-size: 15px;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}
.artist_bio {
    clear: both;
    max-width: 960px;
    padding-top: 10px;
}
.ipad_status {
    min-height: 100vh;
    padding: 48px 24px;
    text-align: center;
}
.ipad_status.secondary {
    color: #f9f9f2;
}
</style>

<style>
.ipad_gallery_image,
.ipad_gallery_image img {
    display: block;
    width: 100%;
    aspect-ratio: 392 / 261;
}

.ipad_gallery_image img {
    object-fit: fill;
}
</style>

<router>
  {
    path: '/ipad',
    alias: ['/ipad/', '/ipad.html']
  }
</router>
