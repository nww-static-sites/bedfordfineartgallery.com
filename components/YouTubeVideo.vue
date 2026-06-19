<template>
    <LazyYoutubeVideo
        v-if="embedLink"
        :src="embedLink"
        :iframe-attributes="iframeAttributes"
        :previewImageSize="previewImageSize"
        :alt="alt"
    />
</template>

<script>
import 'vue-lazy-youtube-video/dist/style.css'
import LazyYoutubeVideo from 'vue-lazy-youtube-video'
import { normalizeYouTubeEmbedUrl } from '~/libs/youtube'

export default {
    components: { LazyYoutubeVideo },
    props: {
        link: {
            type: String,
            required: true,
        },
        previewImageSize: {
            type: String,
            required: false,
            default: 'hqdefault',
        },
        alt: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            iframeAttributes: {
                width: 560,
                height: 315,
                frameborder: 0,
                allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
                allowfullscreen: false,
            },
        }
    },
    computed: {
        embedLink() {
            return normalizeYouTubeEmbedUrl(this.link)
        },
    },
}
</script>
