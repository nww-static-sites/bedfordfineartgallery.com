<template>
    <div>
		<div v-if="artist.header" class="artist_wrap">
			<p :id="`Artist-${artist.header}`" class="artist-header">{{ artist.header }}</p>
		</div>

        <div v-if="hasPaintings" class="artist_wrap">
            <div class="artist_col_img">
                <nuxt-link v-if="gridImage" :to="artistLink"
                    ><nuxt-picture
                        provider="cloudinary"
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
                        <li class="artistheader">Painting:</li>
                        <li v-for="(painting, index) in artist.paintings" :key="index">
                            <nuxt-link :to="`/${painting.replace('-html', '.html')}`">{{ index + 1 }}</nuxt-link>
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
            return gridImage.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
    },
}
</script>

<style scoped>
.artist-header {
    background: #EEEEDB;
    color: #5a0a0b;
    margin: 10px 0px 5px 0px;
    padding: 6px 12px;
    display: block;
	font-size: 1.2em;
	border-radius: 0px;
    width: 100%;
    text-align:center;
    border-bottom: 1px solid #dfddbb;
    font-weight: bold;
}
</style>
