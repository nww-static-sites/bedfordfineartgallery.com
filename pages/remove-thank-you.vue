<template>
    <div class="container primary">
        <section class="wrapper clearfix">
            <div class="artwork_header">
                <h1>Unsubscribe</h1>
                <span class="hr"></span>
            </div>

            <div class="unsubscribe-result">
                <p>
                    If this email address was subscribed, it has been removed from the Art Lovers’ Niche mailing list.
                </p>
                <nuxt-link :to="{ name: 'artists-bios' }">View our gallery</nuxt-link>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    head() {
        return {
            title: "Newsletter Unsubscribe Confirmation | Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Newsletter Unsubscribe Confirmation for Bedford Fine Art Gallery. Return to the gallery website for further information." }],
        }
    },
}
</script>

<style scoped>
.unsubscribe-result {
    background: #ddd1ad;
    border-radius: 20px;
    color: #444;
    margin: 0 auto 32px;
    max-width: 560px;
    padding: 20px;
}

.unsubscribe-result p {
    font-size: 18px;
    line-height: 1.45;
    margin: 0 0 16px;
}

.unsubscribe-result a {
    background: #823631;
    border-radius: 8px;
    color: #fff8ed;
    display: inline-block;
    font-size: 17px;
    font-weight: 700;
    padding: 10px 12px;
    text-decoration: none;
}

.unsubscribe-result a:focus-visible {
    outline: 2px solid #642620;
    outline-offset: 2px;
}

@media (max-width: 480px) {
    .unsubscribe-result {
        border-radius: 16px;
        padding: 16px;
    }
}
</style>

<router>
    {
        path: '/remove_thank_you.htm',
        caseSensitive: true,
    }
</router>
