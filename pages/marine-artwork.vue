<template>
    <Gallery :category="category" :paintings="paintings" />
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Marine'

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
            title: 'Victorian Marine Artwork for Sale – Timeless Ocean Scenes',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Exquisite Victorian marine artwork for sale, featuring detailed seascapes and ships that capture the essence of the era. Perfect for maritime art collectors.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/marine_artwork.html',
  }
</router>
