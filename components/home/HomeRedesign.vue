<template>
    <main class="bfa-home">
        <div class="bfa-home__flow">
            <section class="bfa-home__intro" aria-labelledby="bfa-home-intro-title">
                <h1 id="bfa-home-intro-title" class="bfa-home__intro-title">
                    Some paintings stop you mid-breath. We find those paintings.
                </h1>
                <div class="bfa-home__intro-grid">
                    <p class="bfa-home__intro-copy">
                        Joan and Jerry Hawk have been passionate collectors of fine art for 39 years, and for 14 years
                        have been sharing that collection with the world. Bedford Fine Art Gallery was built on decades
                        of hands-on expertise and a reputation for honesty. Museum directors say so. Certified
                        appraisers say so. So do the customers who keep coming back from across the country and around
                        the world.
                    </p>
                    <div class="bfa-home__intro-aside">
                        <img
                            class="bfa-home__intro-photo"
                            src="https://img.bedfordfineartgallery.com/joan_jerry_26_homepage.jpg"
                            width="550"
                            height="733"
                            alt="Joan and Jerry Hawk at Bedford Fine Art Gallery"
                            loading="lazy"
                            decoding="async"
                        >
                        <nuxt-link :to="{ name: 'artists-bios' }" class="bfa-home__button">Online Art Gallery</nuxt-link>
                        <p class="bfa-home__intro-caption">Find a painting that speaks to you.</p>
                    </div>
                </div>
            </section>

            <section class="bfa-home__panel bfa-home__panel--dark bfa-home__testimonials" aria-labelledby="bfa-home-testimonials-title">
                <HomeImageMarquee :images="customerImages" label="Bedford Fine Art Gallery customers with their paintings" variant="customers" />
                <h2 id="bfa-home-testimonials-title" class="bfa-home__section-title">
                    Our customers are the best. Here's what they have to say.
                </h2>
                <HomeTestimonialFade :testimonials="testimonials" />
                <nuxt-link :to="{ name: 'testimonials' }" class="bfa-home__button bfa-home__button--soft">
                    Read More Testimonials
                </nuxt-link>
            </section>

            <section class="bfa-home__panel bfa-home__panel--tan bfa-home__sold" aria-labelledby="bfa-home-sold-title">
                <h2 id="bfa-home-sold-title" class="bfa-home__section-title">Some Notable Sales to Many Happy Customers</h2>
                <p class="bfa-home__sold-copy">
                    Bedford Fine Art Gallery is your best resource for finding paintings with that "wow factor", that
                    are the focal point in any room. The best testimonials to the fine art people have fallen in love
                    with are our notable sales to many happy customers throughout the United States and in select
                    locations around the world. Unique one-of-a-kind work. Once sold, it is gone forever.
                </p>
                <SoldPaintingsMarquee :paintings="soldPaintings" lazy-images />
            </section>

            <section class="bfa-home__panel bfa-home__panel--dark bfa-home__leaders" aria-labelledby="bfa-home-leaders-title">
                <h2 id="bfa-home-leaders-title" class="bfa-home__section-title bfa-home__leaders-title">
                    For over 30 years we have had the great pleasure to work with leaders who share our passion for fine
                    art. Here are some of the kind words they had to say.
                </h2>
                <div class="bfa-home__leaders-grid">
                    <div>
                        <h3 class="bfa-home__subheading">Dr. Terri Nicole Sawyer</h3>
                        <HomeYouTube video-id="cFAempT0P1Y" title="Dr. Terri Nicole Sawyer discusses Bedford Fine Art Gallery" />
                    </div>
                    <div class="bfa-home__leader-copy">
                        <p>
                            "I first met Joan and Jerry through a recommendation from my sister to go see their wonderful
                            collection. Once I started to talk with them, I could see how much they loved learning about
                            the psychology of art like me! I had the privilege to speak about Dialectical Behavioral
                            Therapy art viewing and how the brain works when you view art. Art creates a safe place to
                            bring forth emotions and Bedford Fine Art Gallery provided a relaxed environment, helping
                            people find the art they love."
                        </p>
                        <strong>Dr. Terri Nicole Sawyer, LCSW, CFLE + C-DBT</strong>
                    </div>
                </div>
                <div v-show="leadersExpanded" class="bfa-home__leaders-more">
                    <article v-for="leader in additionalLeaders" :key="leader.name">
                        <p>{{ leader.quote }}</p>
                        <strong>{{ leader.name }}</strong>
                    </article>
                </div>
                <button
                    type="button"
                    class="bfa-home__button bfa-home__button--soft bfa-home__expand"
                    :aria-expanded="String(leadersExpanded)"
                    @click="leadersExpanded = !leadersExpanded"
                >
                    {{ leadersExpanded ? 'Read Less' : 'Read More' }}
                    <span class="bfa-home__expand-arrow" aria-hidden="true">{{ leadersExpanded ? '▲' : '▼' }}</span>
                </button>
            </section>

            <section class="bfa-home__panel bfa-home__panel--tan bfa-home__helping" aria-labelledby="bfa-home-helping-title">
                <h2 id="bfa-home-helping-title" class="bfa-home__section-title">
                    Bedford Fine Art Gallery - Helping you find "the one."
                </h2>
                <div class="bfa-home__helping-grid">
                    <ul>
                        <li>Your home should feel like you, not like a hotel lobby.</li>
                        <li>Great collectors do not have to be art experts. They are people who buy what moves them and never look back.</li>
                        <li>The right piece does not simply fill a wall. It changes how a room feels at the end of a long day, when the light is low and the house is finally quiet.</li>
                        <li>When you find it, give yourself five minutes with it. No distractions. Just look. You will know.</li>
                        <li>That is the piece that makes guests stop mid-conversation and ask, “Where did you get that?”</li>
                    </ul>
                    <HomeYouTube video-id="TGu-5wpJxGw" title="Your Bedford Fine Art Gallery Experience" />
                </div>
                <p class="bfa-home__phone">
                    Call Us Anytime:
                    <a href="tel:+17244590612" aria-label="Call Bedford Fine Art Gallery at 724-459-0612">724-459-0612</a>
                </p>
            </section>

            <section class="bfa-home__panel bfa-home__panel--dark bfa-home__paintings" aria-labelledby="bfa-home-paintings-title">
                <h2 id="bfa-home-paintings-title" class="bfa-home__paintings-title">
                    <span>19TH CENTURY</span>
                    <strong>PAINTINGS</strong>
                </h2>
                <p class="bfa-home__paintings-copy">
                    Welcome to Bedford Fine Art Gallery. Located in historic Bedford, Pennsylvania, the gallery offers a
                    wide variety of works from some of the greatest and most well-known 19th century artists, early 20th
                    century artists, and contemporary realism artists. You can see all of our available 19th century
                    artwork on our <nuxt-link :to="{ name: 'artists-bios' }">Gallery page</nuxt-link>. Our current
                    inventory boasts a wide diversity of subject matter from
                    <nuxt-link :to="{ name: 'landscape-artwork' }">landscape</nuxt-link>,
                    <nuxt-link :to="{ name: 'marine-artwork' }">marine</nuxt-link>,
                    <nuxt-link :to="{ name: 'still-life-artwork' }">still life</nuxt-link>,
                    <nuxt-link :to="{ name: 'genre-artwork' }">genre</nuxt-link>,
                    <nuxt-link :to="{ name: 'historical-and-political-artwork' }">American historical/political</nuxt-link>,
                    <nuxt-link :to="{ name: 'sporting-art' }">sporting art</nuxt-link>, and
                    <nuxt-link :to="{ name: 'animal-artwork' }">animal</nuxt-link> themes and
                    <nuxt-link :to="{ name: 'sculpture' }">sculptures</nuxt-link>. Our gallery features both American
                    and European 19th century painters such as
                    <a href="/john_henry_dolph_art.html">John Henry Dolph</a>,
                    <a href="/george_t_hetzel_artist.html">George Hetzel</a>,
                    <a href="/william_bromley_III.html">William Bromley III</a>, and
                    <a href="/barton_stone_hays_art.html">Barton Stone Hays</a>, to name a few. To see more of our 19th
                    century artists, please visit our <nuxt-link :to="{ name: 'artists' }">Artists page</nuxt-link>.
                    Good art is timeless and only you know what "wows" you. You know it when you see it and we hope you
                    make that connection with a stunning painting from Bedford Fine Art Gallery.
                </p>
                <HomeImageMarquee :images="artworkImages" label="Featured artwork" variant="artwork" />
                <div class="bfa-home__categories">
                    <h3>Visit Our Online Gallery</h3>
                    <nav aria-label="Artwork categories">
                        <nuxt-link v-for="category in categories" :key="category.label" :to="category.to">
                            {{ category.label }}
                        </nuxt-link>
                    </nav>
                </div>
            </section>

            <section class="bfa-home__panel bfa-home__panel--tan bfa-home__destination" aria-labelledby="bfa-home-destination-title">
                <div class="bfa-home__destination-grid">
                    <div class="bfa-home__destination-visual">
                        <h2 id="bfa-home-destination-title">
                            <span>BEDFORD FINE ART</span>
                            <strong>GALLERY</strong>
                        </h2>
                        <nuxt-link :to="{ name: 'artists-bios' }">
                            <img
                                src="https://img.bedfordfineartgallery.com/gallery_logo.jpg"
                                width="798"
                                height="515"
                                alt="Bedford Fine Art Gallery"
                                loading="lazy"
                                decoding="async"
                            >
                        </nuxt-link>
                    </div>
                    <div>
                        <h3 class="bfa-home__destination-heading">The Ultimate Destination for Fine Art</h3>
                        <div class="bfa-home__destination-scroll" tabindex="0">
                            <ul>
                                <li v-for="benefit in destinationBenefits" :key="benefit.title">
                                    <strong>{{ benefit.title }}</strong> {{ benefit.copy }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bfa-home__panel bfa-home__panel--dark bfa-home__shipping" aria-labelledby="bfa-home-shipping-title">
                <img
                    class="bfa-home__shipping-map"
                    src="https://img.bedfordfineartgallery.com/shipping_options_1200.png"
                    width="1200"
                    height="825"
                    alt="Bedford Fine Art Gallery shipping options across the United States"
                    loading="lazy"
                    decoding="async"
                    role="button"
                    tabindex="0"
                    aria-label="Play or pause the shipping options audio"
                    @click="toggleShippingAudio"
                    @keydown.enter="toggleShippingAudio"
                    @keydown.space.prevent="toggleShippingAudio"
                >
                <div class="bfa-home__shipping-copy">
                    <h2 id="bfa-home-shipping-title">Our Delivery Process is Unmatched</h2>
                    <p>
                        Play the audio to learn about our shipping options.
                        <button type="button" @click="transcriptOpen = true">Read Transcript</button>
                    </p>
                    <audio
                        ref="shippingAudio"
                        src="/images/bedford-shipping-options-voiceover-2026-06-21.mp3"
                        preload="metadata"
                        controls
                    />
                </div>
            </section>

            <section class="bfa-home__videos" aria-label="Bedford Fine Art Gallery videos">
                <article v-for="video in videos" :key="video.videoId" class="bfa-home__video-card">
                    <h2>{{ video.heading }}</h2>
                    <HomeYouTube :video-id="video.videoId" :title="video.title" />
                    <nuxt-link :to="video.to" class="bfa-home__button">{{ video.button }}</nuxt-link>
                </article>
            </section>
        </div>

        <HomePressMarquee />

        <div v-if="transcriptOpen" class="bfa-home__modal" @click.self="transcriptOpen = false">
            <section role="dialog" aria-modal="true" aria-labelledby="bfa-home-transcript-title" class="bfa-home__modal-panel">
                <button type="button" class="bfa-home__modal-close" aria-label="Close transcript" @click="transcriptOpen = false">×</button>
                <h2 id="bfa-home-transcript-title">Shipping Audio Transcript</h2>
                <p v-for="paragraph in shippingTranscript" :key="paragraph">{{ paragraph }}</p>
            </section>
        </div>
    </main>
</template>

<script>
import HomeImageMarquee from '~/components/home/HomeImageMarquee'
import HomePressMarquee from '~/components/home/HomePressMarquee'
import HomeTestimonialFade from '~/components/home/HomeTestimonialFade'
import HomeYouTube from '~/components/home/HomeYouTube'
import SoldPaintingsMarquee from '~/components/SoldPaintingsMarquee'

const customerImageFiles = [
    '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
    '11.jpg', '12.jpg', '65.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '68.jpg', '18.jpg',
    '19.jpg', '20.jpg', '21.jpg', '22.jpg', '23.jpg', '24.jpg', '67.jpg', '25.jpg', '47.jpg', '64.jpg',
    '26.jpg', '27.jpg', '28.jpg', '50.jpg', '45.jpg', '29.jpg', '61.jpg', '30.jpg', '31.jpg', '32.jpg',
    '33.jpg', '46.jpg', '59.jpg', '34.jpg', '35.jpg', '63.jpg', '43.jpg', '49.jpg', '56.jpg', '76.jpg',
    '36.jpg', '37.jpg', '66.jpg', '38.jpg', '39.jpg', '40.jpg', '58.jpg', '75.jpg', '41.jpg', '42.jpg',
    '44.jpg', '51.jpg', '52.jpg', '85.jpg', '53.jpg', '80.jpg', '54.jpg', '55.jpg', '57.jpg', '81.jpg',
    '60.jpg', '62.jpg', '69.jpg', '70.jpg', '71.jpg', '72.jpg', '73.jpg', '74.jpg', '77.jpg', '78.jpg',
    '79.jpg', '93.jpg', '90.jpg', '91.jpg', '113.jpg', '92.jpg', '108.jpg', '94.jpg', '97.jpg', '98.jpg',
    '99_zwy5rn.jpg', '111.jpg', '100.jpg', '119.jpg', '103.jpg', '104.jpg', '105.jpg', '106.jpg', '109.jpg', '112.jpg',
    '115.jpg', '116.jpg', '117.jpg', '118.jpg',
]

export default {
    name: 'HomeRedesign',
    components: {
        HomeImageMarquee,
        HomePressMarquee,
        HomeTestimonialFade,
        HomeYouTube,
        SoldPaintingsMarquee,
    },
    props: {
        scrollingHomepageImages: {
            type: Array,
            required: true,
        },
        soldPaintings: {
            type: Array,
            required: true,
        },
        testimonials: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            leadersExpanded: false,
            transcriptOpen: false,
            categories: [
                { label: 'Landscape', to: { name: 'landscape-artwork' } },
                { label: 'Marine', to: { name: 'marine-artwork' } },
                { label: 'Still Life', to: { name: 'still-life-artwork' } },
                { label: 'Genre', to: { name: 'genre-artwork' } },
                { label: 'Historical / Political', to: { name: 'historical-and-political-artwork' } },
                { label: 'Sporting Art', to: { name: 'sporting-art' } },
                { label: 'Animal', to: { name: 'animal-artwork' } },
                { label: 'Sculptures', to: { name: 'sculpture' } },
                { label: 'All', to: { name: 'artists-bios' } },
            ],
            videos: [
                { heading: 'Virtual Tour', videoId: 'VgdCn2gIF0Y', title: 'Bedford Fine Art Gallery virtual tour', button: 'Online Art Gallery', to: { name: 'artists-bios' } },
                { heading: "Art Lovers' Niche", videoId: 'oY3C5t3A1zQ', title: "Art Lovers' Niche", button: 'Subscribe Now', to: { name: 'art-lovers-niche' } },
                { heading: 'Charles Augustus Lasar Quotes.', videoId: '6cJ4bSC_AGw', title: 'Charles Augustus Lasar Quotes', button: 'Fall In Love', to: { name: 'artists-bios' } },
            ],
            additionalLeaders: [
                {
                    quote: 'My interest in art conservation began as an undergraduate student at Boston University and led to a lifelong practice in painting conservation. For decades, it has been my pleasure to include Joan and Jerry Hawk among my clientele. They are conscientious and attentive to caring for artwork responsibly, and I see that same attention applied to their prospective clients.',
                    name: 'Michael Max Mosorjak, MFA, BFA, Proprietor of Painting Conservation Laboratory',
                },
                {
                    quote: 'I have and continue to be extremely impressed with the Bedford Fine Art Gallery. The flawlessly restored facility meets all environmental museum standards. The individual quality of its diverse collections is exemplary, the research associated with each work is thorough, and every aspect of its administration reflects sophisticated professional standards.',
                    name: 'Michael M. Strueber, BS, MED, MA, Director Emeritus, Southern Alleghenies Museum of Art',
                },
                {
                    quote: "I make it a point to visit galleries whenever I travel and am usually disappointed by the quality and presentation. I was very pleasantly surprised by Bedford Fine Art Gallery's collection in both depth and quality. It is far superior to most galleries I have visited in major American cities.",
                    name: 'Sam Berkovitz, Certified Appraiser, Appraisers Association of America',
                },
            ],
            destinationBenefits: [
                { title: 'ART IS SMART:', copy: 'Your home is typically your biggest investment, so it makes sense to enrich your beautiful home with the perfect complement - fine art.' },
                { title: 'BEST OF THE BEST:', copy: 'We specialize in the sale of unique original 19th century paintings by well-listed 19th century artists at the pinnacle of their prestigious careers.' },
                { title: 'OLD IS THE NEW NEW!:', copy: 'Like the beautiful architecture of an older building or the sleek lines of a classic automobile, good art is timeless.' },
                { title: 'EXPERIENCE COUNTS:', copy: 'With over 30 years of experience collecting fine art, we exceed expectations for both the new buyer and the seasoned fine art collector.' },
                { title: 'IMPECCABLE ETHICS:', copy: 'You can trust our reputation by viewing the paintings we have sold, throughout the years, to many happy customers.' },
                { title: 'OUTSTANDING SELECTION:', copy: 'Over 200 paintings for you to fall in love with.' },
                { title: 'YOUR LEGACY:', copy: 'You acquire a piece of history that preserves your legacy and lives on forever.' },
                { title: 'PAINTING QUALITY:', copy: 'Unlike most galleries and auction houses, the painting you purchase from Bedford Fine Art Gallery is ready to hang on your wall from day one, for many years of enjoyment.' },
                { title: 'PAINTING IMAGE:', copy: 'Our in-house photo studio ensures you get representative images.' },
                { title: 'UP-TO-DATE WEBSITE:', copy: 'Our user-friendly website lists artwork currently available as well as sold items.' },
                { title: 'ZOOM / SUPER ZOOM:', copy: 'View a painting up close in great detail, perhaps as well as or better than in person.' },
                { title: 'CUSTOM APP:', copy: 'Our app lets you see how a painting will look on your wall.' },
                { title: 'AUTHENTICITY GUARANTEE:', copy: 'You get a guarantee of authenticity.' },
                { title: 'TRADE-IN GUARANTEE:', copy: 'You get a trade-in guarantee, so the value of your artwork never decreases.' },
                { title: 'PRIVATE VIEWING:', copy: 'We can bring art to you, within a set distance, to preview in private.' },
                { title: 'PREMIUM SHIPPING:', copy: 'Your artwork is professionally packaged for the best possible protection.' },
                { title: 'BIG CITY ART AT SMALL TOWN PRICES:', copy: 'Without the overhead of a big-city gallery or auction house, we pass the savings on to you.' },
            ],
            shippingTranscript: [
                'For your peace of mind, Bedford Fine Art Gallery entrusts all packaging and shipping to our long-standing professional associates who specialize in fine art transport.',
                'They use industry standard materials and methods to ensure your fine art is professionally packed, fully protected, and safely delivered to your location.',
                'You can let us know if you want bubble wrap cushioning in a sturdy corrugated box for package durability meeting UPS and FedEx parcel packaging standards or if you prefer your piece can be prepared according to museum-grade standards.',
                'For museum-grade standards, your artwork would be wrapped in acid-free glassine paper and soft foam, with the wrapped piece then being placed in a double-walled corrugated sandwich with shrink wrap.',
                'Your fine art would then be inserted into a custom-made art box with double-walled corrugated cardboard, and lined with layers of heavy-duty bubble wrap cushioning and sheets of one eighth inch tempered Masonite on all six sides.',
                'For clients desiring white-glove service, we also work with a highly reliable private courier.',
                'Our private courier delivers pieces in a dedicated Mercedes Sprinter van, ensuring secure, direct, and careful transport to your home or business.',
            ],
        }
    },
    computed: {
        customerImages() {
            return customerImageFiles.map((file) => ({
                src: `https://img.bedfordfineartgallery.com/customer-images/${file}`,
                alt: 'Bedford Fine Art Gallery customer with fine art',
                width: 290,
                height: 200,
            }))
        },
        artworkImages() {
            return this.scrollingHomepageImages
                .filter((painting) => painting && (painting.gridImage || painting.mediumResImage))
                .map((painting) => ({
                    src: painting.gridImage || painting.mediumResImage,
                    alt: painting.mainImageAltText || painting.title || 'Fine art at Bedford Fine Art Gallery',
                    href: `/${String(painting.slug || '').replace('-html', '.html')}`,
                    width: 290,
                    height: 200,
                }))
        },
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.handleKeydown)
    },
    methods: {
        toggleShippingAudio() {
            const audio = this.$refs.shippingAudio
            if (!audio) {
                return
            }

            if (audio.paused) {
                const playPromise = audio.play()
                if (playPromise && playPromise.catch) {
                    playPromise.catch(() => {})
                }
            } else {
                audio.pause()
            }
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.transcriptOpen = false
            }
        },
    },
}
</script>

<style scoped>
.bfa-home {
    background: #fbfbf6;
    color: #444;
    overflow: hidden;
    width: 100%;
}

.bfa-home *,
.bfa-home *::before,
.bfa-home *::after {
    box-sizing: border-box;
    letter-spacing: 0;
}

.bfa-home__flow {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin: 0 auto;
    max-width: 1200px;
    padding: 5px 16px 20px;
    width: 100%;
}

.bfa-home__intro {
    margin: 0 auto;
    max-width: 1110px;
    padding: 20px 30px 0;
    width: 100%;
}

.bfa-home__intro-title,
.bfa-home__section-title,
.bfa-home__subheading,
.bfa-home__destination-heading,
.bfa-home__shipping-copy h2,
.bfa-home__video-card h2 {
    text-transform: none;
}

.bfa-home__intro-title {
    color: #505050;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    margin: 0 0 18px;
    text-align: center;
}

.bfa-home__intro-grid {
    align-items: center;
    column-gap: 34px;
    display: grid;
    grid-template-columns: minmax(0, 2fr) 320px;
}

.bfa-home__intro-copy {
    color: #444;
    font-size: 28px;
    line-height: 1.36;
    margin: 0;
}

.bfa-home__intro-aside {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    width: 320px;
}

.bfa-home__intro-photo {
    border-radius: 12px;
    display: block;
    height: auto;
    margin: 0 auto;
    max-height: 240px;
    max-width: 100%;
    object-fit: contain;
    width: auto;
}

.bfa-home__intro-caption {
    color: #333;
    font-size: 15px;
    line-height: 1.35;
    margin: 0;
    text-align: center;
}

.bfa-home__panel {
    border-radius: 20px;
    margin: 0 auto;
    overflow: hidden;
    padding: 24px 34px;
    width: 100%;
}

.bfa-home__panel--dark {
    background: #222;
    color: #f2f2f2;
}

.bfa-home__panel--tan {
    background: #ddd1ad;
    color: #444;
}

.bfa-home__section-title {
    color: inherit;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
    text-align: center;
}

.bfa-home__button {
    align-items: center;
    background: #242424;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
    color: #fff;
    display: flex;
    font-size: 15px;
    font-weight: 700;
    justify-content: center;
    line-height: 1.25;
    margin: 0 auto;
    min-height: 46px;
    padding: 11px 22px;
    text-align: center;
    text-decoration: none;
    text-transform: none;
    width: min(100%, 280px);
}

.bfa-home__button:hover,
.bfa-home__button:focus-visible {
    background: #333;
    color: #fff;
}

.bfa-home__button--soft {
    background: #3b3b3b;
}

.bfa-home__button--soft:hover,
.bfa-home__button--soft:focus-visible {
    background: #464646;
}

.bfa-home__testimonials {
    padding: 20px 18px 18px;
}

.bfa-home__testimonials .bfa-home__section-title {
    margin: 14px 0 2px;
}

.bfa-home__testimonials .bfa-home__button {
    margin-top: 8px;
    width: 250px;
}

.bfa-home__sold {
    padding-bottom: 28px;
}

.bfa-home__sold-copy {
    font-size: 16px;
    line-height: 1.55;
    margin: 10px auto 14px;
    max-width: 940px;
}

.bfa-home__leaders {
    padding: 34px 44px 30px;
}

.bfa-home__leaders-title {
    margin: 0 auto 26px;
    max-width: 920px;
}

.bfa-home__leaders-grid {
    align-items: center;
    display: grid;
    gap: 34px;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
}

.bfa-home__subheading {
    color: #f2f2f2;
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 10px;
    text-align: center;
}

.bfa-home__leader-copy {
    font-size: 16px;
    line-height: 1.55;
}

.bfa-home__leader-copy p,
.bfa-home__leaders-more p {
    color: #f2f2f2;
    margin: 0 0 14px;
}

.bfa-home__leaders-more {
    margin: 24px auto 0;
    max-width: 960px;
}

.bfa-home__leaders-more article {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px 0;
}

.bfa-home__expand {
    cursor: pointer;
    margin-top: 22px;
    width: 150px;
}

.bfa-home__expand-arrow {
    font-size: 10px;
    margin-left: 8px;
}

.bfa-home__helping {
    padding-bottom: 18px;
}

.bfa-home__helping-grid {
    align-items: center;
    display: grid;
    gap: 28px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin-top: 18px;
}

.bfa-home__helping-grid ul {
    margin: 0;
    padding-left: 20px;
}

.bfa-home__helping-grid li {
    font-size: 16px;
    line-height: 1.42;
    margin-bottom: 8px;
}

.bfa-home__phone {
    color: #505050;
    font-size: 22px;
    font-weight: 700;
    margin: 12px 0 0;
    text-align: center;
}

.bfa-home__phone a {
    color: inherit;
    text-decoration: none;
}

.bfa-home__paintings {
    padding: 30px 34px 24px;
}

.bfa-home__paintings-title {
    color: #f2f2f2;
    margin: 0 0 12px;
    text-align: center;
    text-transform: none;
}

.bfa-home__paintings-title span,
.bfa-home__paintings-title strong {
    display: block;
    font-weight: 400;
}

.bfa-home__paintings-title span {
    font-size: 28px;
    line-height: 1.25;
}

.bfa-home__paintings-title strong {
    font-size: 54px;
    line-height: 1.1;
    margin-top: 8px;
}

.bfa-home__paintings-copy {
    color: #f2f2f2;
    font-size: 16px;
    line-height: 1.58;
    margin: 0 0 10px;
}

.bfa-home__paintings-copy a {
    color: #ccb38d;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
}

.bfa-home__categories {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    margin-top: 16px;
    padding: 14px 16px;
}

.bfa-home__categories h3 {
    color: #f2f2f2;
    font-size: 18px;
    margin: 0 0 12px;
    text-align: center;
    text-transform: none;
}

.bfa-home__categories nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    justify-content: center;
}

.bfa-home__categories a {
    background: #242424;
    border-radius: 999px;
    color: #f2f2f2;
    font-size: 14px;
    font-weight: 700;
    padding: 8px 14px;
    text-decoration: none;
    white-space: nowrap;
}

.bfa-home__destination-grid {
    align-items: start;
    display: grid;
    gap: 42px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.bfa-home__destination-visual h2 {
    color: #444;
    margin: 0 0 18px;
    text-align: center;
    text-transform: none;
}

.bfa-home__destination-visual h2 span,
.bfa-home__destination-visual h2 strong {
    display: block;
    font-weight: 400;
}

.bfa-home__destination-visual h2 span {
    border-bottom: 1px solid rgba(120, 108, 73, 0.35);
    font-size: 28px;
    line-height: 1.25;
    padding-bottom: 7px;
}

.bfa-home__destination-visual h2 strong {
    font-size: 54px;
    line-height: 1.1;
    margin-top: 8px;
}

.bfa-home__destination-visual img {
    border: 5px solid #786c49;
    border-radius: 14px;
    display: block;
    height: auto;
    width: 100%;
}

.bfa-home__destination-heading {
    color: #444;
    font-size: 21px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 10px;
    text-align: center;
}

.bfa-home__destination-scroll {
    max-height: 440px;
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-gutter: stable;
}

.bfa-home__destination-scroll ul {
    margin: 0;
    padding-left: 20px;
}

.bfa-home__destination-scroll li {
    font-size: 16px;
    line-height: 1.4;
    margin-bottom: 8px;
}

.bfa-home__shipping {
    align-items: center;
    display: grid;
    gap: 34px;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
    padding: 34px;
}

.bfa-home__shipping-map {
    border-radius: 12px;
    cursor: pointer;
    display: block;
    height: auto;
    max-height: 439px;
    object-fit: contain;
    width: 100%;
}

.bfa-home__shipping-copy h2 {
    color: #f2f2f2;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
    margin: 0 0 18px;
}

.bfa-home__shipping-copy p {
    border-bottom: 1px solid rgba(244, 242, 236, 0.45);
    color: #f2f2f2;
    font-size: 16px;
    line-height: 1.45;
    margin: 0 0 14px;
    padding-bottom: 12px;
}

.bfa-home__shipping-copy button {
    background: transparent;
    border: 0;
    color: #f2f2f2;
    cursor: pointer;
    font: inherit;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.bfa-home__shipping-copy audio {
    max-width: 340px;
    width: 100%;
}

.bfa-home__videos {
    display: grid;
    gap: 22px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0 auto;
    width: 100%;
}

.bfa-home__video-card h2 {
    color: #555;
    font-size: 19px;
    font-weight: 400;
    line-height: 1.3;
    margin: 0 0 9px;
    text-align: center;
}

.bfa-home__video-card .bfa-home__button {
    margin-top: 14px;
    max-width: 300px;
    width: 90%;
}

.bfa-home__modal {
    align-items: center;
    background: rgba(0, 0, 0, 0.72);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 20px;
    position: fixed;
    z-index: 10000;
}

.bfa-home__modal-panel {
    background: #fbfbf6;
    border-radius: 8px;
    color: #444;
    max-height: 86vh;
    max-width: 760px;
    overflow-y: auto;
    padding: 30px;
    position: relative;
    width: 100%;
}

.bfa-home__modal-panel h2 {
    color: #742924;
    font-size: 24px;
    margin: 0 40px 18px 0;
    text-transform: none;
}

.bfa-home__modal-panel p {
    font-size: 16px;
    line-height: 1.55;
}

.bfa-home__modal-close {
    background: transparent;
    border: 0;
    color: #444;
    cursor: pointer;
    font-size: 30px;
    line-height: 1;
    padding: 4px;
    position: absolute;
    right: 16px;
    top: 12px;
}

@media screen and (max-width: 900px) {
    .bfa-home__intro-grid,
    .bfa-home__leaders-grid,
    .bfa-home__helping-grid,
    .bfa-home__destination-grid,
    .bfa-home__shipping {
        grid-template-columns: minmax(0, 1fr);
    }

    .bfa-home__intro-grid {
        row-gap: 18px;
    }

    .bfa-home__intro-aside {
        justify-self: center;
        max-width: 320px;
        width: 100%;
    }

    .bfa-home__leaders-grid,
    .bfa-home__helping-grid,
    .bfa-home__destination-grid,
    .bfa-home__shipping {
        gap: 24px;
    }

    .bfa-home__videos {
        grid-template-columns: minmax(0, 1fr);
        margin: 0 auto;
        max-width: 620px;
    }

    .bfa-home__shipping-copy {
        text-align: center;
    }

    .bfa-home__shipping-copy h2 {
        text-align: center;
    }
}

@media screen and (max-width: 767px) {
    .bfa-home__flow {
        gap: 20px;
        padding: 5px 12px 20px;
    }

    .bfa-home__intro {
        padding: 13px 4px 0;
    }

    .bfa-home__intro-title {
        font-size: 20px;
        line-height: 1.22;
        margin-bottom: 10px;
    }

    .bfa-home__intro-copy {
        font-size: 18px;
        line-height: 1.48;
        margin-bottom: 4px;
    }

    .bfa-home__intro-grid {
        row-gap: 8px;
    }

    .bfa-home__intro-photo {
        max-height: 240px;
    }

    .bfa-home__panel {
        border-radius: 16px;
        padding: 20px 16px;
    }

    .bfa-home__section-title {
        font-size: 20px;
    }

    .bfa-home__testimonials {
        padding: 16px 10px;
    }

    .bfa-home__testimonials .bfa-home__section-title {
        margin-top: 12px;
    }

    .bfa-home__sold-copy,
    .bfa-home__paintings-copy,
    .bfa-home__leader-copy,
    .bfa-home__helping-grid li,
    .bfa-home__destination-scroll li,
    .bfa-home__shipping-copy p {
        font-size: 15px;
    }

    .bfa-home__leaders {
        padding: 22px 16px 24px;
    }

    .bfa-home__leaders-title {
        margin-bottom: 20px;
    }

    .bfa-home__helping-grid {
        margin-top: 14px;
    }

    .bfa-home__phone {
        font-size: 19px;
        margin-top: 8px;
    }

    .bfa-home__paintings {
        padding: 22px 14px 20px;
    }

    .bfa-home__paintings-title span {
        font-size: 22px;
    }

    .bfa-home__paintings-title strong,
    .bfa-home__destination-visual h2 strong {
        font-size: 42px;
    }

    .bfa-home__categories {
        padding: 13px 8px;
    }

    .bfa-home__categories nav {
        gap: 8px;
    }

    .bfa-home__categories a {
        font-size: 12px;
        padding: 7px 10px;
    }

    .bfa-home__destination-visual h2 span {
        font-size: 22px;
    }

    .bfa-home__destination-scroll {
        max-height: 340px;
    }

    .bfa-home__shipping {
        padding: 24px 16px;
    }

    .bfa-home__shipping-map {
        max-height: none;
    }

    .bfa-home__video-card h2 {
        font-size: 18px;
    }

    .bfa-home__modal-panel {
        padding: 24px 18px;
    }
}
</style>
