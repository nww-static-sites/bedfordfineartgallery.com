<template>
    <div class="layout">
        <HeaderDefault />
        <nuxt />
        <FooterDefault />
    </div>
</template>

<script>
import HeaderDefault from '~/components/HeaderDefault'
import FooterDefault from '~/components/FooterDefault'

export default {
    components: { HeaderDefault, FooterDefault }
}
</script>