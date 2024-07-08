<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">19th Century Sculptures</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Sculpture'

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
            title: '19th Century Sculptures For Sale: Victorian Sculptures',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Discover and purchase 19th century sculptures, featuring exquisite craftsmanship and historical significance. Own a timeless masterpiece from this remarkable era.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/sculpture.html'
  }
</router>
