<template>
    <div aria-hidden="true">
        <VueSlickCarousel v-bind="settings">
            <div v-for="image in customerImages" :key="image.file">
                <img :src="image.src" width="290" height="200" alt="" loading="lazy" />
            </div>
        </VueSlickCarousel>
    </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel'
import 'vue-slick-carousel/dist/vue-slick-carousel.css'
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'
import customerImageFiles from '~/data/customer-images.json'

const customerImages = customerImageFiles.map((file) => ({
    file,
    src: `https://img.bedfordfineartgallery.com/customer-images/${file}`,
}))

export default {
    name: 'CustomerSlidingImages',
    components: { VueSlickCarousel },
    data() {
        return {
            customerImages,
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
}
</script>
