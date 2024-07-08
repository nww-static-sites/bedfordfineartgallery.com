<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">Victorian Landscape Art</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Landscape'

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
            title: 'Victorian Landscape Art For Sale: Timeless Beauty & Elegance',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Discover the charm of Victorian landscape art, showcasing breathtaking scenes of nature\'s beauty and elegance. Explore our curated collection today!',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/landscape_artwork.html',
  }
</router>
