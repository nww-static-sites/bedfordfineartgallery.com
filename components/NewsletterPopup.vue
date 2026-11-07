<template>
    <aside
        class="aln"
        :class="{ 'is-visible': visible, 'is-open': expanded }"
        aria-label="Art Lovers’ Niche newsletter"
        @keydown.esc="collapse"
    >
        <button
            ref="toggle"
            class="aln__toggle"
            type="button"
            :aria-expanded="expanded ? 'true' : 'false'"
            aria-controls="aln-content"
            @click="expanded = !expanded"
        >
            <span class="aln__heading"
                ><span class="aln__title">Join Art Lovers’ Niche</span
                ><span class="aln__subtitle">{{ tagline }}</span></span
            >
            <span class="aln__toggle-icon" aria-hidden="true"><span class="aln__triangle"></span></span>
        </button>
        <div
            id="aln-content"
            class="aln__drawer"
            :inert="expanded ? null : ''"
            :aria-hidden="expanded ? 'false' : 'true'"
        >
            <div class="aln__clip">
                <div class="aln__body">
                    <p class="aln__lead"><strong>One thoughtful email a month for people who love art.</strong></p>
                    <p>
                        Skip the clutter. Art Lovers’ Niche brings the best of the gallery to your inbox: new paintings,
                        artist stories, and honest insight, all in one short read.
                    </p>
                    <p class="aln__benefits-label"><strong>What you get, once a month:</strong></p>
                    <ul class="aln__benefits">
                        <li>New paintings and recent finds</li>
                        <li>Artist stories and the history behind the art</li>
                        <li>Gallery news, plus local tips if you’re planning a visit to Bedford, PA</li>
                        <li>Insight that makes you a more confident art lover</li>
                    </ul>
                    <p class="aln__promise">No spam. Just one email a month.</p>
                    <NewsletterSignup input-id="aln-popup-email" popup />
                </div>
            </div>
        </div>
    </aside>
</template>

<script>
import NewsletterSignup from '~/components/NewsletterSignup'
const taglines = [
    'See New Art First',
    'Honest Art Insight',
    'Artist Stories',
    'Collect with Confidence',
    'Monthly Newsletter',
]
export default {
    components: { NewsletterSignup },
    data() {
        return { visible: false, expanded: false, tagline: taglines[0], timer: null }
    },
    watch: {
        '$route.fullPath'() {
            this.expanded = false
            this.reveal()
        },
    },
    mounted() {
        if (document.readyState === 'complete') this.reveal()
        else window.addEventListener('load', this.reveal, { once: true })
    },
    beforeDestroy() {
        clearTimeout(this.timer)
        window.removeEventListener('load', this.reveal)
    },
    methods: {
        reveal() {
            this.visible = false
            this.tagline = taglines[Math.floor(Math.random() * taglines.length)]
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.visible = true
            }, 650)
        },
        collapse() {
            if (this.expanded) {
                this.expanded = false
                this.$refs.toggle.focus({ preventScroll: true })
            }
        },
    },
}
</script>
