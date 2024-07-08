<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">Victorian Genre Art</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Genre'

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
            title: 'Victorian Genre Art For Sale: Timeless Masterpieces',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Explore our collection of Victorian genre art for sale. Own a piece of history with these timeless masterpieces, capturing everyday life in exquisite detail.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/genre_artwork.html'
  }
</router>
