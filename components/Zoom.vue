<template>
    <vue-picture-swipe :items="items" :options="{ shareEl: false }"></vue-picture-swipe>
</template>

<script>
import VuePictureSwipe from 'vue-picture-swipe'

export default {
    components: { VuePictureSwipe },
    props: {
        painting: {
            type: Object,
            required: true,
        },
        mobile: {
            type: Boolean,
            required: true,
        },
        alt: {
            type: String,
            required: true,
        },
        useArtOnWallImage: {
            type: Boolean,
            required: false,
        },
    },
    data() {
        let src, thumbnail, w, h

        if (this.useArtOnWallImage) {
            src = this.painting.artOnWallImage
            thumbnail = this.painting.artOnWallImage
            w = this.painting.artOnWallImageWidth
            h = this.painting.artOnWallImageHeight
        } else {
            if (this.mobile) {
                src = this.painting.mediumResImage
                thumbnail = this.painting.mediumResImage
                w = this.painting.mediumResImageWidth
                h = this.painting.mediumResImageHeight
            } else {
                src = this.painting.highResImage || this.painting.mediumResImage
                thumbnail = this.painting.mediumResImage
                w = this.painting.highResImage ? this.painting.highResImageWidth : this.painting.mediumResImageWidth
                h = this.painting.highResImage ? this.painting.highResImageHeight : this.painting.mediumResImageHeight
            }
        }

        return {
            items: [
                {
                    src,
                    thumbnail,
                    w,
                    h,
                    alt: this.alt,
                },
            ],
        }
    },
}
</script>
