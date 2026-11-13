<template>
    <div>
        <div class="btn-container">
            <a href="highlights.html" class="btn btn_active">Art Blog</a>
            <a href="art_lovers_niche.htm" class="btn">Art Lovers' Niche</a>
        </div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="niche-banner">
                    <img
                        src="/images/art-lovers-niche-banner-20260921.png"
                        alt="Art Lovers' Niche"
                        width="1983"
                        height="793"
                        decoding="async"
                    />
                </div>

                <div class="lead_callout_niche">
                    <h1 class="newsletter-heading">A Newsletter For People Who Love Fine Art</h1>
                    <p class="newsletter-intro">
                        Explore unique, newly discovered and featured fine art. Enter your email address below to join
                        our newsletter:
                    </p>

                    <div class="search" style="margin-bottom: 1.2rem">
                        <NewsletterSignup input-id="niche-top-email" />
                    </div>

                    <ArtLoversNicheArticlePreview
                        v-for="article in recentArticles"
                        :key="article.slug"
                        :art-lovers-niche-article="article"
                    />

                    <section v-if="archiveYears.length" class="niche-archive" aria-labelledby="past-articles">
                        <div class="archive-controls">
                            <h2 id="past-articles">Past Articles:</h2>
                            <button
                                v-for="year in archiveYears"
                                :id="`archive-year-${year}`"
                                :key="year"
                                type="button"
                                class="archive-year"
                                :aria-expanded="openYear === year ? 'true' : 'false'"
                                :aria-controls="`archive-panel-${year}`"
                                @click="openYear = openYear === year ? null : year"
                            >
                                {{ year }}
                                <span class="archive-arrow" aria-hidden="true"></span>
                            </button>
                        </div>
                        <section
                            v-for="year in archiveYears"
                            :id="`archive-panel-${year}`"
                            :key="year"
                            :aria-labelledby="`archive-year-${year}`"
                            :hidden="openYear !== year"
                            class="archive-panel"
                        >
                            <template v-if="openYear === year">
                                <ArtLoversNicheArticlePreview
                                    v-for="article in archivedArticles[year]"
                                    :key="article.slug"
                                    :art-lovers-niche-article="article"
                                />
                            </template>
                        </section>
                    </section>

                    <div class="lower_content">
                        <div class="club-tabs" role="tablist" aria-label="About the club" @keydown="moveClubTab">
                            <button
                                v-for="tab in clubTabs"
                                :id="`club-tab-${tab.id}`"
                                :key="tab.id"
                                type="button"
                                role="tab"
                                :aria-controls="`club-panel-${tab.id}`"
                                :aria-selected="activeClubTab === tab.id ? 'true' : 'false'"
                                :tabindex="activeClubTab === tab.id ? 0 : -1"
                                @click="activeClubTab = tab.id"
                            >
                                {{ tab.label }}
                            </button>
                        </div>
                        <section
                            id="club-panel-join"
                            role="tabpanel"
                            aria-labelledby="club-tab-join"
                            tabindex="0"
                            :hidden="activeClubTab !== 'join'"
                        >
                            <p class="club-quote">
                                "My wife is an artist, and I am a financial advisor, different in many ways. My bride
                                has always desired a collection in fine art. My fear has always been the numbers, what
                                am I paying for, is there an investment value, and is it a fair value? A single customer
                                with two very different views on why to buy art. Jerry and Joan are simply amazing.
                                Their knowledge and passion are second to none. Not only is the collection at Bedford
                                Fine Art Gallery of museum quality, but their passion really inspires you, comforts you,
                                and welcomes you in as a member of what seems like
                                <span style="font-weight: bold">an exclusive club</span>. We are blessed to know them.
                                They will work with you in every way possible to make your dream come true. Our life is
                                now more beautiful because of them, and we look forward to our next purchase."
                                <span style="font-weight: bold">Jason and Alyson L.</span>
                            </p>

                            <p>
                                We probably all know of an ultra-exclusive country club that provides top-tier services
                                exceeding all others in the world. Our customers are the best. We really did not think
                                about the gallery in the context of being like such an exclusive club. The above
                                customer’s comparison, however, may be appropriate based on our
                                <span style="font-weight: bold">many outstanding customers.</span>
                            </p>
                        </section>
                        <section
                            id="club-panel-house"
                            role="tabpanel"
                            aria-labelledby="club-tab-house"
                            tabindex="0"
                            :hidden="activeClubTab !== 'house'"
                        >
                            <ul>
                                <li>
                                    Whether it is our website, Art Lovers’ Niche mailer, or the brick-and-mortar (club
                                    house!), here in Bedford, our customers have exclusive access to the
                                    best-of-the-best fine art to fall in love with.
                                </li>
                                <li>
                                    We always knew our house would be the perfect venue for displaying fine art. The
                                    lighting we use at the gallery is also used by some of the finest museums in the
                                    world, such as: Metropolitan Museum of Art, Carnegie Museum, National Gallery of
                                    Art, and the Van Gogh Museum (just to name a few).
                                </li>
                            </ul>
                        </section>
                        <section
                            id="club-panel-members"
                            role="tabpanel"
                            aria-labelledby="club-tab-members"
                            tabindex="0"
                            :hidden="activeClubTab !== 'members'"
                        >
                            <ul>
                                <li>
                                    During the pandemic, Amazon reached out to Bedford Fine Art Gallery and secured six
                                    19th century paintings for a movie they were making. The movie is now out and is
                                    titled "Master."
                                </li>
                                <li>
                                    One of the largest family-owned companies in the world (22 manufacturing facilities,
                                    55+ retail locations, in 84 countries) purchased paintings from Bedford Fine Art
                                    Gallery for their corporate fine art collection.
                                </li>
                                <li>
                                    When a major organization needed fine art for their new board room, overlooking the
                                    three rivers in Pittsburgh, PA, they purchased several paintings from Bedford Fine
                                    Art Gallery.
                                </li>
                                <li>
                                    Some of the biggest fine art collectors in New York, with family members at
                                    Sotheby’s and the Metropolitan Museum of Art, have been long-time customers of
                                    Bedford Fine Art Gallery.
                                </li>
                                <li>
                                    A major publisher for a new book, coming out soon, recently secured permission to
                                    use one of our paintings for the cover of the book.
                                </li>
                                <li>
                                    Whether our customers (club members!) are in the art field or in another
                                    line-of-work (chocolatier, financial planner, doctor, lawyer, IT / design
                                    specialist, teacher, aerospace engineer, outstanding small-business entrepreneur,
                                    etc.),
                                    <span style="font-weight: bold"
                                        ><u>all</u> our customers are intelligent, personable, and highly
                                        successful.</span
                                    >
                                </li>
                            </ul>
                        </section>
                    </div>
                    <p class="newsletter-intro">
                        Explore unique, newly discovered and featured fine art. Enter your email address below to join
                        our newsletter:
                    </p>
                    <div class="search" style="margin-bottom: 1.2rem">
                        <NewsletterSignup input-id="niche-bottom-email" />
                    </div>
                </div>
            </section>
        </div>
        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll />
            </section>
        </div>
    </div>
</template>

<script>
import ArtLoversNicheArticlePreview from '~/components/ArtLoversNicheArticlePreview'
import TestimonialsScroll from '~/components/TestimonialsScroll'
import NewsletterSignup from '~/components/NewsletterSignup'

const recentArticleCount = 12
const clubTabs = [
    { id: 'join', label: 'Join Our Club' },
    { id: 'house', label: 'Club House' },
    { id: 'members', label: 'Club Members' },
]

export default {
    components: { TestimonialsScroll, ArtLoversNicheArticlePreview, NewsletterSignup },
    async asyncData({ $content }) {
        return {
            artLoversNicheArticles: await $content('artLoversNicheArticles')
                .only(['slug', 'date', 'preview', 'listingImage'])
                .sortBy('date', 'desc')
                .fetch(),
        }
    },
    data() {
        return { openYear: null, activeClubTab: 'join', clubTabs }
    },
    computed: {
        recentArticles() {
            return this.artLoversNicheArticles.slice(0, recentArticleCount)
        },
        archivedArticles() {
            const groups = {}
            for (const article of this.artLoversNicheArticles.slice(recentArticleCount)) {
                const match = /^\d{4}(?=-)/.exec(article.date)
                const year = match ? match[0] : 'Undated'
                if (!groups[year]) groups[year] = []
                groups[year].push(article)
            }
            return groups
        },
        archiveYears() {
            const yearNumber = (year) => (year === 'Undated' ? 0 : Number(year))
            return Object.keys(this.archivedArticles).sort((a, b) => yearNumber(b) - yearNumber(a))
        },
    },
    methods: {
        moveClubTab(event) {
            const index = clubTabs.findIndex((tab) => tab.id === this.activeClubTab)
            const count = clubTabs.length
            const destinations = {
                ArrowLeft: (index + count - 1) % count,
                ArrowRight: (index + 1) % count,
                Home: 0,
                End: count - 1,
            }
            const next = destinations[event.key]
            if (!Number.isInteger(next)) return
            event.preventDefault()
            this.activeClubTab = clubTabs[next].id
            event.currentTarget.querySelectorAll('[role="tab"]')[next].focus()
        },
    },
}
</script>

<style scoped>
.newsletter-heading {
    font-size: clamp(1.4em, 3vw, 1.65em);
    font-weight: bold;
    text-transform: none;
    line-height: 1.3;
    padding: 0;
    margin: 1rem auto 0;
    text-align: center;
}
.newsletter-intro {
    text-align: center;
    max-width: 500px;
    margin: auto;
    padding: 1rem 0;
    font-size: 1.1em;
    line-height: 1.8em;
}

.niche-banner {
    position: relative;
    width: 100%;
    max-width: 660px;
    aspect-ratio: 1983 / 528;
    margin: 0 auto;
    overflow: hidden;
    border-radius: clamp(20px, 6vw, 40px);
    background: #f9f9f2;
}

.niche-banner img {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: auto;
    transform: translateY(-16%);
}

.search {
    border: 1px solid #222;
    overflow: hidden;
    border-radius: 12px;
    max-width: 550px;
    margin: 0 auto 0px auto;
}
.search form {
    display: flex;
    margin: 0;
}

.search .newsletter-email {
    border: 0px;
    flex: 1;
    min-width: 0;
    width: 0;
    margin: 0;
    padding: 10px;
    background: #f9f9f2;
}

.search .newsletter-email:focus {
    outline: 2px solid #222;
    outline-offset: -3px;
}

.search input[type='submit'] {
    border: 0px;
    background-color: #222;
    color: #fff;
    flex: 0 0 auto;
    margin: 0;
    padding: 10px;
    border-radius: 0;
    cursor: pointer;
}
.search input[type='submit']:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -4px;
}

.search input {
    width: auto;
}

/* ===========================
   ====== Medua Query for Search Box ======
   =========================== */

@media only screen and (min-width: 150px) and (max-width: 780px) {
    .search {
        width: 95%;
        margin: 0 auto 0px auto;
    }
}

.lower_content {
    max-width: 860px;
    margin: 20px auto;
}

.niche-archive {
    margin: 24px auto;
}
.archive-controls,
.club-tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
}
.archive-controls h2 {
    margin: 0 6px 0 0;
    padding: 0;
    color: #823631;
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: none;
}
.archive-year {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 6px 16px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: #823631;
    color: #fff8ed;
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}
.archive-year:hover {
    background: #903e38;
}
.archive-year[aria-expanded='true'] {
    border-color: #823631;
    background: #f0e3dd;
    color: #712e2a;
}
.archive-arrow {
    width: 0;
    height: 0;
    border-inline: 4px solid transparent;
    border-top: 5px solid currentColor;
}
.archive-year[aria-expanded='true'] .archive-arrow {
    transform: rotate(180deg);
}
.archive-panel[hidden],
.lower_content [hidden] {
    display: none;
}
.club-tabs {
    justify-content: flex-start;
    gap: 4px;
    margin-bottom: 12px;
    border-bottom: 1px solid #c9aaa0;
}
.club-tabs button {
    flex: 1 1 auto;
    min-height: 44px;
    padding: 8px 6px;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: #712e2a;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
}
.club-tabs button:hover,
.club-tabs button[aria-selected='true'] {
    background: #f0e3dd;
}
.club-tabs button[aria-selected='true'] {
    border-bottom-color: #823631;
}
.archive-year:focus-visible,
.club-tabs button:focus-visible,
.lower_content [role='tabpanel']:focus-visible {
    outline: 2px solid #823631;
    outline-offset: 2px;
}
.lower_content ul {
    list-style: disc;
    margin-left: 16px;
}

.lower_content p,
.lower_content li {
    font-size: 1.1em;
    line-height: 1.8em;
}
.lower_content li {
    margin-bottom: 1em;
}
.lower_content .club-quote {
    margin-bottom: 1.8em;
}

.lead_callout_img {
    max-width: 600px !important;
}

.btn-container {
    max-width: 660px;
    margin: 20px auto 0px auto;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.btn {
    background-color: #681d1e;
    color: #f2f2f2;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    display: inline-block;
    transition: opacity 0.2s ease;
}
.btn_active {
    background-color: transparent;
    border: 1px solid #681d1e;
    color: #681d1e;
}

.btn:hover {
    opacity: 0.85;
}

/* Mobile stacking */
@media (max-width: 480px) {
    .btn-container {
        flex-direction: column;
        align-items: center;
    }
    .btn {
        width: 100%;
        text-align: center;
    }
}
</style>

<router>
  {
    path: '/art_lovers_niche.htm',
  }
</router>
