<template>
    <div class="bfa-youtube">
        <iframe
            :src="embedUrl"
            :title="title"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        />
    </div>
</template>

<script>
export default {
    name: 'HomeYouTube',
    props: {
        videoId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        autoplay: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        embedUrl() {
            const params = new URLSearchParams({
                rel: '0',
                playsinline: '1',
                modestbranding: '1',
                controls: '1',
                cc_load_policy: '1',
                cc_lang_pref: 'en',
                iv_load_policy: '3',
            })

            if (this.autoplay) {
                params.set('autoplay', '1')
                params.set('mute', '1')
                params.set('loop', '1')
                params.set('playlist', this.videoId)
            }

            return `https://www.youtube.com/embed/${this.videoId}?${params.toString()}`
        },
    },
}
</script>

<style scoped>
.bfa-youtube {
    aspect-ratio: 16 / 9;
    background: #111;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    width: 100%;
}

.bfa-youtube iframe {
    border: 0;
    display: block;
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
}
</style>
