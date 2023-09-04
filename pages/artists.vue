<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Artists</h1>
                    <h2>A few of our featured 19th Century artists</h2>
                    <span class="hr"></span>
                </div>

                <div class="col_100">
                    <ArtistNav/>

                    <ArtistPreview
                        v-for="(artist, index) in artists"
                        :key="index"
                        :artist="artist"
                        :painting-to-grid-image="paintingToGridImage"
                    />
                </div>
            </section>
        </div>

        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll :testimonials="testimonials" />
            </section>
        </div>
    </div>
</template>

<script>
import { loadPaintings } from '~/libs/paintings'
import ArtistPreview from '~/components/ArtistPreview'
import ArtistNav from '~/components/ArtistNav'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    components: { ArtistPreview, ArtistNav, TestimonialsScroll },
    async asyncData({ $content }) {
        const artists = await $content('artists').fetch()
        artists.sort((a, b) => {
            const artistNameA = a.name || ''
            const artistNameB = b.name || ''
            return artistNameA.trim().split(' ').pop().toLowerCase().localeCompare(artistNameB.trim().split(' ').pop().toLowerCase())
        })
        const paintingSlugs = artists.map((artist) => artist.paintings && artist.paintings.length > 0 ? artist.paintings[0] : '')

        let lastLetter = ''
        artists.forEach((artist) => {
            const lastNameFirstLetter = artist.name.trim().split(' ').pop().toUpperCase()[0]
            if (lastNameFirstLetter !== lastLetter) {
                lastLetter = lastNameFirstLetter
                artist.header = lastLetter
            }
        })

        return {
            artists,
            paintingToGridImage: await loadPaintings({ $content, paintingSlugs }),
            testimonials: await loadShortTestimonials($content),
        }
    },
}
</script>

<router>
  {
    path: '/Artists.html'
  }
</router>
