<template>
    <Gallery :category="category" :paintings="paintings" />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Past Sales'

export default {
    head() {
        return {
            title: "Notable Painting Sales | Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Browse examples of paintings placed with collectors by Bedford Fine Art Gallery. The gallery’s sold archive shows the range of artists and subjects it has handled." }],
        }
    },
    components: { Gallery },
    async asyncData({ $content }) {
        return {
            paintings: await loadGalleryPaintings({ $content, sold: true }),
        }
    },
    data() {
        return {
            category,
        }
    },
}
</script>

<router>
  {
    path: '/notable_sales.html'
  }
</router>
