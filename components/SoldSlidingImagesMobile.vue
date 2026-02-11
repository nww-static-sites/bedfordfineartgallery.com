<template>
    <div>
        <VueSlickCarousel v-bind="settings">
            <div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_1.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_2.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_3.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_4.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_5.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_6.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_7.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_8.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_9.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_10.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_11.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_12.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_13.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>
<div><img src="https://images.bedfordfineartgallery.com/dg6smdedp/image/upload/sold_grid_carousel_mobile_14.jpg" width="900" height="600" alt="Bedford Fine Art Gallery - 19th Century Fine Art"></div>

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