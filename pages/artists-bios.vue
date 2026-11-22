<template>
    <Gallery :category="category" :paintings="paintings" daily-featured />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

export default {
    head() {
        return {
            title: "Artist Biographies | Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Look up artists by name to find their biographies and gallery pages. These profiles provide background and links to related works where available." }],
        }
    },
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
