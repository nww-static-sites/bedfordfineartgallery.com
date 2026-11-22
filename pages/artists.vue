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
                    <div class="artists-filters" role="group" aria-label="Artist filters">
                        <button
                            v-for="filter in artistFilters"
                            :key="filter.id"
                            type="button"
                            :aria-pressed="artistFilter === filter.id ? 'true' : 'false'"
                            aria-controls="artist-directory-list"
                            @click="artistFilter = filter.id"
                        >
                            {{ filter.label }}
                        </button>
                    </div>

                    <input
                        v-model="searchTerm"
                        class="artists-search"
                        type="search"
                        aria-label="Search Artist Names"
                        placeholder="Search Artist Names"
                    />

                    <ArtistNav :section-letters="sectionLetters" />

                    <div id="artist-directory-list">
                        <ArtistPreview
                            v-for="artist in filteredArtists"
                            :key="artist.slug"
                            :artist="artist"
                            :paintings-by-slug="paintingsBySlug"
                        />

                        <div v-if="filteredArtists.length === 0" style="margin-top: 20px;">
                            No artists found.
                        </div>
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
import { isSoldPainting } from '~/utils/paintingStatus'
import ArtistPreview from '~/components/ArtistPreview'
import ArtistNav from '~/components/ArtistNav'
import TestimonialsScroll from '~/components/TestimonialsScroll'

const artistFilters = [
    { id: 'featured', label: 'Featured Artists' },
    { id: 'past', label: 'Past Artists' },
    { id: 'all', label: 'All Artists' },
]

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

        return {
            artists,
            paintingsBySlug: await loadPaintings({ $content, paintingSlugs, columns: ['slug', 'gridImage', 'status'] }),
        }
    },

    data() {
        return {
            artistFilters,
            artistFilter: 'featured',
            searchTerm: '',
        }
    },

    computed: {
        sectionLetters() {
            return this.filteredArtists.map((artist) => artist.header).filter(Boolean)
        },
        filteredArtists() {
            const term = this.searchTerm.trim().toLowerCase()

            const filtered = this.artists.filter((artist) => {
                if (!artist.paintings?.length || !(artist.name || '').toLowerCase().includes(term)) return false
                if (this.artistFilter === 'all') return true

                const hasAvailablePainting = artist.paintings.some((slug) => !isSoldPainting(this.paintingsBySlug[slug]))
                return this.artistFilter === 'featured' ? hasAvailablePainting : !hasAvailablePainting
            })

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

.artists-filters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    max-width: 480px;
    margin: 0 auto 16px;
}

.artists-filters button {
    min-height: 44px;
    padding: 8px;
    border: 1px solid #c8b8a6;
    border-radius: 12px;
    background: #f9f6ec;
    color: #612824;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    cursor: pointer;
}

.artists-filters button:hover {
    background: #efe7d7;
}

.artists-filters button[aria-pressed='true'] {
    border-color: var(--aln-maroon);
    background: var(--aln-maroon);
    color: var(--aln-cream);
}

.artists-filters button:focus-visible {
    outline: 2px solid var(--aln-maroon);
    outline-offset: 2px;
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
