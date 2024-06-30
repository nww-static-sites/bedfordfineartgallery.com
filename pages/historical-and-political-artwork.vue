<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">19th Century Political Art</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'American Historic / Political'

export default {
    components: { Gallery },
    async asyncData({ $content }) {
        return {
            paintings: await loadGalleryPaintings({ $content, category }),
        }
    },
    data() {
        return {
            category,
        }
    },
    head() {
        return {
            title: '19th Century Political Art: Historic Artwork For Sale',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Explore 19th century political art, showcasing powerful depictions of historical events and figures. Discover and collect these significant masterpieces today.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/historical_and_political_artwork.html'
  }
</router>
