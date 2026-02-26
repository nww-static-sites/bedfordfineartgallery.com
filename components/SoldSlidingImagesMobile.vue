<template>
    <div>
        <VueSlickCarousel v-bind="settings">
            <div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_1_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_2_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_3_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_4_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_5_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_6_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_7_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_8_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_9_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_10_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_11_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_12_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_13_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_14_800.jpg" width="800" height="533" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>

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