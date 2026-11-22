<template>
    <div>
        <h3 v-if="artist.header" :id="`Artist-${artist.header}`" class="artist-header">{{ artist.header }}</h3>

        <div v-if="hasPaintings" class="artist_wrap">
            <div class="artist_col_img">
                <nuxt-link v-if="gridImage" :to="artistLink"
                    ><nuxt-picture
                        provider="bedford"
                        loading="lazy"
                        :src="gridImage"
                        :alt="nameWithTinyDescription"
                        width="392"
                        height="261"
                /></nuxt-link>
            </div>
            <div class="artist_col_links">
                <div class="artist_container">
                    <p>
                        <nuxt-link :to="artistLink">{{ nameWithTinyDescription }}</nuxt-link>
                    </p>
                    <ul>
                        <li v-for="(painting, index) in artist.paintings" :key="index">
                            <nuxt-link class="artist-painting-link" :to="`/${painting.replace('-html', '.html')}`">
                                Painting {{ index + 1 }}
                                <span v-if="isSold(painting)" class="artist-painting-status artist-painting-sold">SOLD</span>
                                <span v-else class="artist-painting-status artist-painting-available">AVAILABLE</span>
                            </nuxt-link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { isSoldPainting } from '~/utils/paintingStatus'

export default {
    props: {
        artist: {
            type: Object,
            required: true,
        },
        paintingsBySlug: {
            type: Object,
            required: true,
        },
    },
    computed: {
        hasPaintings() {
            return this.artist.paintings && this.artist.paintings.length > 0
        },
        artistLink() {
            return this.artist.hasLandingPage
                ? this.artist.slug.replace('-html', '.html')
                : this.artist.paintings.length > 0
                ? this.artist.paintings[0].replace('-html', '.html')
                : ''
        },
        nameWithTinyDescription() {
            let nameWithTinyDescription = this.artist.name || ''
            if (this.artist.tinyDescription) {
                nameWithTinyDescription += ` (${this.artist.tinyDescription})`
            }

            return nameWithTinyDescription
        },
        gridImage() {
            return this.paintingsBySlug[this.artist.paintings[0]]?.gridImage || ''
        },
    },
    methods: {
        isSold(painting) {
            return isSoldPainting(this.paintingsBySlug[painting])
        },
    },
}
</script>

<style scoped>
.artist-header {
    background: #eeeedb;
    color: #5a0a0b;
    max-width: 800px;
    margin: 10px auto 16px;
    padding: 6px 12px;
    font-size: 1.2em;
    border-radius: 10px;
    font-weight: bold;
    scroll-margin-top: 16px;
}

.artist_col_img ::v-deep img {
    display: block;
    aspect-ratio: 392 / 261;
    object-fit: contain;
}

.artist_container ul li .artist-painting-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    font-size: 16px;
    white-space: nowrap;
}

.artist-painting-status {
    padding: 1px 3px 2px;
    border-radius: 3px;
    color: var(--aln-cream);
    font-size: 9px;
    font-weight: 700;
    line-height: 1.15;
}

.artist-painting-sold {
    background: #943f38;
}

.artist-painting-available {
    background: #267f42;
}
</style>
