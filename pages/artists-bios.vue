<template>
    <Gallery :category="category" :featured-paintings="featuredPaintings" :paintings="paintings" />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'
import featuredPaintingSlugs from '~/featured-painting-slugs'

export default {
    components: { Gallery },
    async asyncData({ $content }) {
        const paintings = await loadGalleryPaintings({ $content })

        const featuredPaintings = paintings.filter((painting) => featuredPaintingSlugs.includes(painting.slug))
        return {
            featuredPaintings,
            paintings: paintings.filter((painting) => !featuredPaintings.includes(painting)),
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
