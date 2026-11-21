<template>
    <HomeImageMarquee :images="customerImages" variant="customers" decorative />
</template>

<script>
import HomeImageMarquee from '~/components/home/HomeImageMarquee'
import customerImageFiles from '~/data/customer-images.json'

const customerImages = customerImageFiles.map((file) => ({
    src: `https://img.bedfordfineartgallery.com/customer-images/${file}`,
    width: 290,
    height: 200,
}))

export default {
    name: 'CustomerSlidingImages',
    components: { HomeImageMarquee },
    data() {
        return { customerImages }
    },
}
</script>
