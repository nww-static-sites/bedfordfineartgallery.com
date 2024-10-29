<template>
    <Gallery :category="category" :paintings="paintings" />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Still Life'

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
            title: 'Victorian Still Life Artwork for Sale – Elegant Masterpieces',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Discover Victorian still life artwork for sale, showcasing intricate details and timeless beauty. Perfect for collectors seeking classic compositions.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/still_life_artwork.html'
  }
</router>
