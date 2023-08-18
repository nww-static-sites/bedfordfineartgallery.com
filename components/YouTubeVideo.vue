<template>
	<LazyYoutubeVideo :src="link" :iframe-attributes="iframeAttributes" :previewImageSize="previewImageSize" :alt="alt" />
</template>

<script>
import 'vue-lazy-youtube-video/dist/style.css'
import LazyYoutubeVideo from 'vue-lazy-youtube-video'

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
            required: false
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
}
</script>