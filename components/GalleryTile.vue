<template>
    <li>
        <div :class="{ sold: isSoldOrHold }">
            <span v-if="isSoldOrHold" class="soldTag">{{ soldOrHoldText }}</span>

            <nuxt-link :to="painting.slug.replace('-html', '.html')">
                <nuxt-img
                    provider="cloudinary"
                    loading="lazy"
                    :src="galleryImage"
                    :alt="painting.mainImageAltText"
                    width="392"
                    height="261"
                />
                <p class="artist_gallery_title">
                    <span v-if="isNew" class="gallery_new_label label">NEW</span>
                    <span v-if="isHold" class="gallery_new_label label">HOLD</span>
                    <span v-if="isJerrysPick" class="gallery_new_label label">JERRY'S PICK</span>
                    <span v-if="isJoansPick" class="gallery_new_label label">JOAN'S PICK</span>
                    {{ artistNameWithTinyDescription }}
                </p>
                <p class="artist_gallery_artwork">{{ painting.title }}</p>
            </nuxt-link>
        </div>
    </li>
</template>

<script>
import { artistNameWithTinyDescription } from '~/libs/artist'

export default {
    props: {
        painting: {
            type: Object,
            required: true,
        },
    },
    computed: {
        artistNameWithTinyDescription() {
            return artistNameWithTinyDescription(this.painting.artist)
        },
        isNew() {
            return this.painting.status === 'New'
        },
        isHold() {
            return this.painting.status === 'Hold'
        },
        isJerrysPick() {
            return this.painting.status === "Jerry's Pick"
        },
        isJoansPick() {
            return this.painting.status === "Joan's Pick"
        },
        isSoldOrHold() {
            return ['Sold', 'Hold'].includes(this.painting.status)
        },
        soldOrHoldText() {
            return this.painting.status.toLowerCase()
        },
        galleryImage() {
            const galleryImage =
                this.painting.galleryCropImage || this.painting.gridImage || this.painting.mediumResImage || ''
            return galleryImage.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
    },
}
</script>

<style scoped>
.gallery_new_label {
    padding: 5px;
    display: inline-block;
    margin-right: 5px;
    border-radius: 2px;
    background: #b90d0f;
    color: #ffffff;
    font-size: 12px;
    line-height: 12px;
    text-decoration: none;
    font-weight: normal;
}
</style>
