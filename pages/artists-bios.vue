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
    head() {
        return {
            meta: [
                {
                    hid: 'cx-cache-benchmark-gallery',
                    name: 'cx-cache-benchmark-gallery',
                    content: 'cx-cache-optimized-c-20260714-003',
                },
            ],
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
