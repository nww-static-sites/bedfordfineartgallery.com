<template>
    <div aria-live="polite" :aria-busy="loading ? 'true' : 'false'">
        <VueSlickCarousel v-if="testimonials.length" v-bind="settings">
            <div v-for="testimonial in testimonials" :key="testimonial.id">
                <p class="reverse" style="text-align: left">
                    {{ testimonial.shortTestimonial }}
                </p>
                <span style="display: block; font-weight: bold; color: #edebdb; padding-left: 10px">{{
                    testimonial.name
                }}</span>
            </div>
        </VueSlickCarousel>
        <p v-else-if="loadFailed" class="reverse" style="text-align: left">
            Testimonials are temporarily unavailable.
        </p>
        <p v-else class="reverse" style="text-align: left">Loading testimonials&hellip;</p>
    </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel'
import { loadShortTestimonialsClient } from '~/libs/testimonials-client'
import 'vue-slick-carousel/dist/vue-slick-carousel.css'
// optional style for arrows & dots
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'

export default {
    components: { VueSlickCarousel },
    data() {
        return {
            testimonials: [],
            loading: true,
            loadFailed: false,
            settings: {
                arrows: true,
                dots: false,
                autoplay: true,
                autoplaySpeed: 10000,
                adaptiveHeight: true,
            },
        }
    },
    mounted() {
        loadShortTestimonialsClient()
            .then((testimonials) => {
                this.testimonials = testimonials
            })
            .catch(() => {
                this.loadFailed = true
            })
            .then(() => {
                this.loading = false
            })
    },
}
</script>
