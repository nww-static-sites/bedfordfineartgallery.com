<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Testimonials</h1>
                    <h2>What Our Customers are Saying</h2>
                    <span class="hr"></span>
                </div>

                <div style="max-width: 960px; margin: auto">
                    <div
                        v-for="(testimonial, index) in testimonials"
                        :id="`testimonial-${index + 1}`"
                        :key="testimonial.id"
                        style="padding: 0px 10px 10px 10px; border-bottom: 1px solid #dfe1bc"
                    >
                        <p style="text-align: left">"{{ testimonial.longTestimonial }}"</p>
                        <span style="display: block; font-weight: bold; padding-top: 5px">{{ testimonial.name }}</span>
                    </div>
                    <p v-if="loading" aria-live="polite">Loading testimonials&hellip;</p>
                    <p v-else-if="loadFailed" aria-live="polite">Testimonials are temporarily unavailable.</p>

                    <div class="breadcrumb">
                        <nuxt-link to="/" style="width: 90%; margin: 0 auto 24px auto; max-width: 320px"
                            >Back to Home</nuxt-link
                        >
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { loadLongTestimonialsClient } from '~/libs/testimonials-client'

export default {
    data() {
        return {
            testimonials: [],
            loading: true,
            loadFailed: false,
        }
    },
    mounted() {
        loadLongTestimonialsClient()
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

<style scoped>
strong {
    font-weight: bold;
}
</style>

<router>
  {
    path: '/testimonials.htm',
  }
</router>
