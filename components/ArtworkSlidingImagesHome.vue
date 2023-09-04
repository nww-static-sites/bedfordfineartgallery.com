<template>
    <div>
        <VueSlickCarousel v-bind="settings">
            <nuxt-link
                v-for="scrollingHomepageImage in scrollingHomepageImages"
                :key="scrollingHomepageImage.slug"
                :to="scrollingHomepageImage.slug.replace('-html', '.html')"
                ><nuxt-img
                    provider="cloudinary"
                    :src="getImage(scrollingHomepageImage)"
                    width="290"
                    height="200"
                    :alt="scrollingHomepageImage.title"
            /></nuxt-link>
        </VueSlickCarousel>
    </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel'
import 'vue-slick-carousel/dist/vue-slick-carousel.css'
// optional style for arrows & dots
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'

export default {
    components: { VueSlickCarousel },
    props: {
        scrollingHomepageImages: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            settings: {
                arrows: false,
                dots: false,
                infinite: true,
                slidesToShow: 6,
                slidesToScroll: 1,
                autoplay: true,
                speed: 9000,
                autoplaySpeed: 2000,
                cssEase: 'linear',
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            infinite: true,
                            dots: true,
                        },
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2,
                            initialSlide: 2,
                        },
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        },
                    },
                ],
            },
        }
    },
    methods: {
        getImage(scrollingHomepageImage) {
            const image = scrollingHomepageImage.gridImage
                ? scrollingHomepageImage.gridImage
                : scrollingHomepageImage.mediumResImage
            return image.replace('https://res.cloudinary.com/dg6smdedp/image/upload', '')
        },
    },
}
</script>
