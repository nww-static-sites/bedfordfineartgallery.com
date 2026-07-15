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
                    content: 'cx-cache-control-a-20260714-001',
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
