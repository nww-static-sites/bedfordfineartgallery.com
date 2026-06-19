<template>
    <Gallery :category="category" :paintings="paintings" daily-featured />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

export default {
    components: { Gallery },
    async asyncData({ $content }) {
        const paintings = await loadGalleryPaintings({ $content })

        return {
            paintings,
        }
    },
    data() {
        return {
            category: 'All'
        }
    },
}
</script>

<router>
  {
    path: '/Artists--Bios.html',
    caseSensitive: true,
  }
</router>
