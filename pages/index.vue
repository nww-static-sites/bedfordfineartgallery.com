<template>
    <HomeRedesign
        :scrolling-homepage-images="scrollingHomepageImages"
        :sold-paintings="soldPaintings"
    />
</template>

<script>
import HomeRedesign from '~/components/home/HomeRedesign'
import { loadGalleryPaintings } from '~/libs/paintings'

export default {
    name: 'HomePage',
    components: {
        HomeRedesign,
    },
    async asyncData({ $content }) {
        return {
            scrollingHomepageImages: await loadGalleryPaintings({
                $content,
                scrollingHomepageImage: true,
                columns: ['title', 'slug', 'gridImage', 'mediumResImage', 'mainImageAltText'],
            }),
            soldPaintings: await $content('paintings')
                .only(['title', 'slug', 'gridImage', 'gridImageWidth', 'gridImageHeight'])
                .where({ status: { $eq: 'Sold' } })
                .fetch(),
        }
    },
    head() {
        return {
            meta: [{ hid: 'description', name: 'description', content: "Browse original 19th-century paintings at Bedford Fine Art Gallery in Bedford, Pennsylvania. Explore available works, see the gallery’s notable sales and meet Joan and Jerry Hawk." }],
            title: "19th Century Paintings for Sale | Bedford Fine Art Gallery",
            script: [
                {
                    type: 'application/ld+json',
                    json: {
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'Bedford Fine Art Gallery',
                        image: 'https://img.bedfordfineartgallery.com/logo.png',
                        url: 'https://www.bedfordfineartgallery.com',
                        telephone: '724-459-0612',
                        address: {
                            '@type': 'PostalAddress',
                            streetAddress: '230 South Juliana St.',
                            addressLocality: 'Bedford',
                            addressRegion: 'PA',
                            postalCode: '15522',
                            addressCountry: 'US',
                        },
                        geo: {
                            '@type': 'GeoCoordinates',
                            latitude: 40.0160567,
                            longitude: -78.5039377,
                        },
                        openingHoursSpecification: {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                            opens: '10:00',
                            closes: '17:00',
                        },
                    },
                },
            ],
        }
    },
}
</script>
