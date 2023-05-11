<template>
    <div>
        <VueSlickCarousel v-bind="settings">
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_1.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_2.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_3.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_4.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_5.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_6.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_7.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_8.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_9.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_10.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_11.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_12.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_13.jpg" /></div>
            <div><nuxt-picture provider="cloudinary" src="sold_grid_carousel_mobile_14.jpg" /></div>

           </VueSlickCarousel>
    </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel'
import 'vue-slick-carousel/dist/vue-slick-carousel.css'
// optional style for arrows & dots
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'

export default {
    name: 'MyComponent',
    components: { VueSlickCarousel },
    data() {
        return {
            settings: {
                arrows: false,
                dots: false,
                infinite: true,
                slidesToShow: 6,
                slidesToScroll: 1,
                autoplay: true,
                fade: true,
                speed: 2000,
                autoplaySpeed: 3000,
                cssEase: 'linear',
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: true,
                            dots: true,
                        },
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            initialSlide: 1,
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
}
</script>