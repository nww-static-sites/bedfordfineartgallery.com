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
                            </nuxt-link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        artist: {
            type: Object,
            required: true,
        },
        paintingToGridImage: {
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
            const gridImage = this.paintingToGridImage[this.artist.paintings[0]]
                ? this.paintingToGridImage[this.artist.paintings[0]].gridImage
                : ''
            return gridImage
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

.artist_container ul li .artist-painting-link {
    padding: 4px 9px;
    font-size: 16px;
}
</style>
