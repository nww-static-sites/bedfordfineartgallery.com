<template>
    <div>
    <h1 style="background-color: #222; color: #edebdb; padding: 15px 0px 0px 10px; margin: 0;">Victorian Animal Art</h1>
    <Gallery :category="category" :paintings="paintings" />
    </div>
</template>

<script>
import Gallery from "~/components/Gallery";
import { loadGalleryPaintings } from '~/libs/paintings'

const category = 'Animal'

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
            title: 'Victorian Animal Art For Sale: Timeless Pieces',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: 'Explore our collection of Victorian animal art for sale. Discover timeless pieces featuring exquisite depictions of animals from the Victorian era.',
                },
            ],
        }
    },
}
</script>

<router>
  {
    path: '/animal_artwork.html'
  }
</router>
