<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">19th Century Sporting Artwork</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Sporting Art'

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
            title: '19th Century Sporting Artwork For Sale',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Discover and purchase 19th century sporting artwork, featuring classic depictions of historic sports &  leisure activities. Own a piece of sporting history now.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/sporting_art.html'
  }
</router>
