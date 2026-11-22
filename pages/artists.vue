<template>
    <div class="artists-directory">
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Artists Featured at Our Gallery</h1>
                    <h2>19th and 20th Century Artists and Paintings</h2>
                    <span class="hr"></span>
                </div>

                <div class="col_100">
                    <input
                        v-model="searchTerm"
                        class="artists-search"
                        type="search"
                        aria-label="Search Artist Names"
                        placeholder="Search Artist Names"
                    />

                    <ArtistNav :section-letters="sectionLetters" />

                    <ArtistPreview
                        v-for="(artist, index) in filteredArtists"
                        :key="index"
                        :artist="artist"
                        :paintings-by-slug="paintingsBySlug"
                    />

                    <div v-if="filteredArtists.length === 0" style="margin-top: 20px;">
                        No artists found.
                    </div>
                </div>
            </section>
        </div>

        <TestimonialsScroll />
        <a class="artists-back-to-top" href="#top"><span aria-hidden="true">↑</span> Back to Top</a>
    </div>
</template>

<script>
import { loadPaintings } from '~/libs/paintings'
import ArtistPreview from '~/components/ArtistPreview'
import ArtistNav from '~/components/ArtistNav'
import TestimonialsScroll from '~/components/TestimonialsScroll'

export default {
    head() {
        return {
            title: "19th-Century Artists & Paintings | Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Browse featured artists and open their pages to see related paintings. The directory brings historical and more recent artists into one place." }],
        }
    },
    components: { ArtistPreview, ArtistNav, TestimonialsScroll },

    async asyncData({ $content }) {
        const artists = await $content('artists')
            .only(['name', 'slug', 'hasLandingPage', 'tinyDescription', 'paintings'])
            .fetch()

        artists.sort((a, b) => {
            const artistNameA = a.name || ''
            const artistNameB = b.name || ''
            return artistNameA
                .trim()
                .split(' ')
                .pop()
                .toLowerCase()
                .localeCompare(
                    artistNameB
                        .trim()
                        .split(' ')
                        .pop()
                        .toLowerCase()
                )
        })

        const paintingSlugs = [...new Set(artists.flatMap((artist) => artist.paintings || []))]

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
            paintingsBySlug: await loadPaintings({ $content, paintingSlugs, columns: ['slug', 'gridImage', 'status'] }),
        }
    },

    data() {
        return {
            searchTerm: '',
        }
    },

    computed: {
        sectionLetters() {
            return this.filteredArtists.map((artist) => artist.header).filter(Boolean)
        },
        filteredArtists() {
            const term = this.searchTerm.trim().toLowerCase()

            const filtered = !term
                ? this.artists
                : this.artists.filter((artist) =>
                      (artist.name || '').toLowerCase().includes(term)
                  )

            // Rebuild headers so letters still display correctly after filtering
            let lastLetter = ''
            return filtered.map((artist) => {
                const updatedArtist = { ...artist }
                const lastNameFirstLetter = (updatedArtist.name || '')
                    .trim()
                    .split(' ')
                    .pop()
                    .toUpperCase()[0]

                if (lastNameFirstLetter !== lastLetter) {
                    lastLetter = lastNameFirstLetter
                    updatedArtist.header = lastLetter
                } else {
                    updatedArtist.header = ''
                }

                return updatedArtist
            })
        },
    },
}
</script>

<style scoped>
.artists-directory .artwork_header h1,
.artists-directory .artwork_header h2 {
    text-transform: none;
}

.artists-directory .artwork_header h1 {
    font-weight: 700;
}

.artists-search {
    display: block;
    width: 100%;
    max-width: 420px;
    box-sizing: border-box;
    margin: 0 auto 20px;
    padding: 10px 12px;
    appearance: none;
    font-size: 17px;
    border: 1px solid #777;
    border-radius: 16px;
}
</style>

<style>
@media (prefers-reduced-motion: no-preference) {
    html:has(.artists-directory) {
        scroll-behavior: smooth;
    }
}

.artists-directory .artists-back-to-top {
    /* Match the Art Lovers’ Niche popup's desktop and mobile edge spacing. */
    --artists-floating-edge: 20px;
    position: fixed;
    z-index: 50;
    left: max(var(--artists-floating-edge), env(safe-area-inset-left));
    bottom: max(var(--artists-floating-edge), env(safe-area-inset-bottom));
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 13px;
    color: #555;
    background: #f7f7f7;
    border: 1px solid #d0d0d0;
    border-radius: 12px;
    font: 16px/1.5 Arial, Helvetica, sans-serif;
    text-decoration: none;
}

.artists-directory .artists-back-to-top:hover {
    background: #ededed;
}

@media (max-width: 620px) {
    /* Keep the two fixed controls accessible when their widths would overlap. */
    body:has(.aln.is-visible) .artists-directory .artists-back-to-top {
        bottom: calc(max(var(--artists-floating-edge), env(safe-area-inset-bottom)) + 86px);
    }

    body:has(.aln.is-open) .artists-directory .artists-back-to-top {
        visibility: hidden;
    }
}

@media (max-width: 480px) {
    .artists-directory .artists-back-to-top {
        --artists-floating-edge: 12px;
    }
}
</style>

<router>
  {
    path: '/Artists.html'
  }
</router>
