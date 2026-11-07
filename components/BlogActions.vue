<template>
    <nav class="blog-actions" :class="{ 'blog-actions-with-back': showBack }" aria-label="Explore more from Bedford Fine Art Gallery">
        <a v-if="showBack" class="blog-action" href="/highlights.html">
            <span class="blog-action-title">Back to Blog</span>
        </a>
        <a class="blog-action" href="/art_lovers_niche.htm">
            <span class="blog-action-title">Join the Art Lovers' Niche</span>
            <span class="blog-action-description">A newsletter for people who love fine art.</span>
        </a>
        <a class="blog-action" href="/Artists--Bios.html">
            <span class="blog-action-title">Visit Online Gallery</span>
            <span class="blog-action-description">Find a painting that speaks to you.</span>
        </a>
    </nav>
</template>

<script>
export default {
    props: {
        showBack: { type: Boolean, default: false },
    },
}
</script>

<style scoped>
.blog-actions {
    clear: both;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
    padding: 32px 0 16px;
}

.blog-action {
    box-sizing: border-box;
    display: flex;
    flex: 0 1 340px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 94px;
    max-width: 100%;
    padding: 16px 12px;
    border: 2px solid #681d1e;
    border-radius: 6px;
    background: #681d1e;
    color: #f2f2f2;
    text-align: center;
    text-decoration: none;
}

.blog-action-title {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.25;
}

.blog-action-description {
    font-size: 16px;
    line-height: 1.4;
    white-space: nowrap;
}

.blog-action:hover {
    background: #4c1516;
    border-color: #4c1516;
    color: #fff;
}

.blog-action:focus-visible {
    outline: 3px solid #681d1e;
    outline-offset: 4px;
}

@media (max-width: 1180px) {
    .blog-actions-with-back {
        flex-direction: column;
        align-items: center;
    }

    .blog-actions-with-back .blog-action {
        flex-basis: auto;
        width: 340px;
    }
}

@media (max-width: 767px) {
    .blog-actions {
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .blog-action {
        flex-basis: auto;
        width: 340px;
    }
}

@media (max-width: 380px) {
    .blog-action {
        padding-right: 6px;
        padding-left: 6px;
    }

    .blog-action-title { font-size: 20px; }
    .blog-action-description { font-size: 14px; }
}
</style>
