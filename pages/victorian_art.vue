<template>
    <div>
        <div class="container primary">
            <section class="wrapper">
                <div class="flex_wrap">
                    <div class="flex_4 flex_sub">
                        <div class="flex_3 flex_3_no_100">
                            <nuxt-img provider="cloudinary" class="home_logo" src="logo_ext.png" width="235" height="127"
                                alt="victorian art
" />
                        </div>
                        <div class="flex_7 flex_center flex_7_no_100">
                            <h2 class="home_tagline">
                                Enriching today’s décor with exceptional paintings from the past
                            </h2>
                        </div>
                    </div>
                    <div class="flex_6">
                        <p class="home_tagline_2">HISTORIC PAINTINGS FOR HISTORIC HOMES</p>
                        <div class="breadcrumb" style="margin-top: 0px">
                            <nuxt-link to="Artists--Bios.html" class="content_btn home_btn_small"><span
                                    class="btn_text_break">view over 150 unique</span>
                                <span class="btn_text_break">original 19TH century paintings for sale</span></nuxt-link>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="container secondary">
            <section class="wrapper">
                <VictorianSlidingImages />

                <div class="flex_wrap" style="margin-top: 1em">
                    <div class="flex_3_3">
                        <div class="video-container">
                            <YouTubeVideo link="https://www.youtube.com/embed/p3p_rUFCeic?rel=0" />
                        </div>
                    </div>
                    <div class="flex_3_3">
                        <div class="video-container">
                            <YouTubeVideo link="https://www.youtube.com/embed/zc_ayyc2NsI?rel=0" />
                        </div>
                    </div>
                    <div class="flex_3_3">
                        <div class="video-container">
                            <YouTubeVideo link="https://www.youtube.com/embed/3asJzvyy-ZQ?rel=0" />
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="container primary" style="background-color: #efefde">
            <section class="wrapper clearfix">
                <p style="text-align: center; color: #222; font-size: 18px; font-weight: bold; margin-bottom: 10px">
                    About the Gallery
                </p>
                <div class="breadcrumb" style="margin-top: 0px">
                    <nuxt-link to="Gallery-Value.html" class="content_btn">Read our story</nuxt-link>
                </div>
                <ul class="productGrid2">
                    <li>
                        <nuxt-link to="eugene_alonzo_poole_skiff.html"><nuxt-picture provider="cloudinary"
                                src="e_a_poole_grid3.jpg"
                                :img-attrs="{ alt: 'Eugene Alonzo Poole (E.A. Poole,  Eugene A. Poole) Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="penrhyn_stanlaws_lincoln.html"><nuxt-picture provider="cloudinary"
                                src="stanlaws_grid.jpg" :img-attrs="{ alt: 'Penrhyn Stanlaws Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="eugene_alonzo_poole_sheep.html"><nuxt-picture provider="cloudinary"
                                src="e_a_poole_grid.jpg"
                                :img-attrs="{ alt: 'Eugene Alonzo Poole (E.A. Poole,  Eugene A. Poole) Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="william_bromley_III_liesure.html"><nuxt-picture provider="cloudinary"
                                src="bromley_grid.jpg" :img-attrs="{ alt: 'William Bromley III Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="barton_stone_hays_tabletop.html"><nuxt-picture provider="cloudinary"
                                src="barton_stone_hays_artwork_grid.jpg"
                                :img-attrs="{ alt: 'Barton Stone Hays (B.S. Hays) Painting' }" /></nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="edward_moran_breakers.html"><nuxt-picture provider="cloudinary"
                                src="edward_moran_grid.jpg" :img-attrs="{ alt: 'Edward Moran Painting' }" />
                        </nuxt-link>
                    </li>
                </ul>
                <div class="breadcrumb"><nuxt-link to="Artists--Bios.html" class="content_btn">view full gallery</nuxt-link>
                </div>
            </section>
        </div>

        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="col_40">
                    <h1 id="homeGallery">VICTORIAN <span class="hr"></span><span class="headingSub">art</span></h1>
                </div>
                <div class="col_60">
                    <p>
                        Welcome to Bedford Fine Art Gallery. We are located in the historic Barclay Mansion in downtown
                        Bedford, Pennsylvania, about one mile from the world famous Bedford Springs Resort. We are a
                        premier U.S. gallery specializing in the sale of 19th and early 20th Century fine victorian art.
                        Whether you are a seasoned collector or are buying fine art for the first time, you can count on
                        finding quality victorian paintings from the best victorian artists of the period. You don’t
                        need an expert art critic to immediately understand and fully appreciate realistic art that
                        pleases now and for many years to come. Victorian home decorating can be a rewarding experience
                        when you include fine art and other historic home decor.
                    </p>
                </div>

                <ul class="productGrid">
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb9.jpg"
                                :img-attrs="{ alt: 'victorian art' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb7.jpg"
                                :img-attrs="{ alt: 'victorian paintings' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb14.jpg"
                                :img-attrs="{ alt: 'victorian home decorating' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb15.jpg"
                                :img-attrs="{ alt: 'victorian artists' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb16.jpg"
                                :img-attrs="{ alt: 'victorian house restoration' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb17.jpg"
                                :img-attrs="{ alt: 'historic home decor' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb23.jpg"
                                :img-attrs="{ alt: 'historic home restoration' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb24.jpg"
                                :img-attrs="{ alt: 'victorian house interior design' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb25.jpg"
                                :img-attrs="{ alt: 'victorian home restoration' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb26.jpg"
                                :img-attrs="{ alt: 'victorian art' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb27.jpg"
                                :img-attrs="{ alt: 'victorian paintings' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="Artists--Bios.html"><nuxt-picture provider="cloudinary" src="thumb28.jpg"
                                :img-attrs="{ alt: 'victorian home decorating' }" />
                        </nuxt-link>
                    </li>
                </ul>
            </section>
        </div>

        <div class="container secondary">
            <section class="wrapper clearfix">
                <div class="col_40">
                    <h2 id="homeArt" class="h1 reverse">
                        Victorian<span class="hr_reverse"></span><span class="headingSub">paintings</span>
                    </h2>
                </div>
                <div class="col_60">
                    <p class="reverse" style="text-align: left">
                        Modern and contemporary art, as well as various prints and reproductions, are still being
                        produced in mass volume. They do not possess the unique absolute limited supply of 19th century
                        realistic fine art and may be worth pennies-on-the-dollar right after your purchase. When
                        writing about the finest art of the 19th Century in a December 1, 2012 article, Kary Mantyk of
                        the Epoch Times (greater New York City Area newspaper) states: "They celebrate humanity, the
                        beauty of the raw power of nature, ideals, veneration for the divine, and the dreams of human
                        beings in a way that can be immediately understood, felt, and appreciated by the viewer. They
                        accomplish that with extraordinary technique and inner vision. A new renaissance is inevitable,
                        when contemporary artists will look back on the great academic artists of the 19th Century for
                        technical guidance and inspiration, which is lacking in modern art. Just as we scoff at those
                        who thought the world was flat, people will one day scoff at those modern works of art now being
                        sold for tens of millions.&quot;
                    </p>
                </div>

                <ul class="productGrid2">
                    <li>
                        <nuxt-link to="auguste_toulmouche_memories.html"><nuxt-picture provider="cloudinary"
                                src="auguste_toulmouche_grid.jpg" :img-attrs="{ alt: 'Auguste Toulmouche Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="morston_constantine_ream_fruit.html"><nuxt-picture provider="cloudinary"
                                src="morston_grid.jpg"
                                :img-attrs="{ alt: 'Morston Constantine Ream (Morston Ream) Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="frank_bromley_niagra.html"><nuxt-picture provider="cloudinary"
                                src="frank_bromley_grid.jpg"
                                :img-attrs="{ alt: 'Frank Bromley (Frank Clark Bromley,  Frank C Bromley) Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="felix_octavious_carr_darley_washington.html"><nuxt-picture provider="cloudinary"
                                src="darley_grid.jpg"
                                :img-attrs="{ alt: 'Felix Octavius Carr Darley (F. O. C. Darley) Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="c_myron_clark_art.html"><nuxt-picture provider="cloudinary"
                                src="c_myron_clark_grid.jpg" :img-attrs="{ alt: 'C. Myron Clark Painting' }" />
                        </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="jules_frederic_ballavoine_art_flowers.html"><nuxt-picture provider="cloudinary"
                                src="ballvoine_grid.jpg" :img-attrs="{ alt: 'Jules Frederic Ballavoine Painting' }" />
                        </nuxt-link>
                    </li>
                </ul>

                <div class="breadcrumb"><nuxt-link to="Artists--Bios.html">View full Gallery</nuxt-link></div>
            </section>
        </div>

        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="col_40">
                    <nuxt-img provider="cloudinary" class="logoSecondary" src="logo.png" width="123" height="124" alt="Victorian Paintings
" />
                    <p class="tagline">Enriching today’s décor with exceptional paintings from the past.</p>
                </div>
                <div class="col_60">
                    <p style="padding-bottom: 0px">
                        At Bedford Fine Art Gallery you can count on finding one-of-a-kind artwork that is aesthetically
                        pleasing from the finest victorian artists. Our artwork represents many well listed artists at
                        the pinnacle of their careers. You work hard and deserve the best. Our fine art selection gets
                        you to the next level in luxury décor, which is well above run-of-the-mill modern art or prints
                        of any kind. We always have over 100 19th century landscape, genre, still life, sporting art,
                        and American historic theme compositions to choose from. We appreciate that you share our
                        passion for historic home restoration and rare fine art. We look forward to your visit.
                    </p>

                    <!--
<p class="content_btn"><a href="gallery.html">view our gallery</a> <a href="Artists.html">artists</a> <a href="directions.html">directions</a></p> -->
                </div>
            </section>
        </div>

        <div style="text-align: center; background-color: #efefde; padding: 12px">
            <h2 class="reverse_header" style="margin-top: 0px; color: #732824; padding-bottom: 10px">
                We have the absolute best customers!
            </h2>
            <nuxt-img provider="cloudinary" style="width: 100%; height: auto; max-width: 1260px; margin-top: 16px"
                src="bfa_customers_map.png" width="2092" height="994" alt="Bedford Fine Art satisfied art customers in the USA, Canada and UK
" />
        </div>
        <div class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)">
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll :testimonials="testimonials" />
            </section>
        </div>
    </div>
</template>

<script>
import TestimonialsScroll from '~/components/TestimonialsScroll'
import VictorianSlidingImages from '~/components/VictorianSlidingImages'
import YouTubeVideo from '~/components/YouTubeVideo'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    components: { TestimonialsScroll, VictorianSlidingImages, YouTubeVideo },
    async asyncData({ $content }) {
        return {
            testimonials: await loadShortTestimonials($content),
        }
    },
    head() {
        return {
            title: 'Victorian Art For Sale - Bedford Fine Art Gallery',
        }
    },
}
</script>

<style scoped>
.flex_3_3 {
    flex-basis: 100%;
}

@media screen and (min-width: 600px) {
    .flex_3_3 {
        flex-basis: 32%;
    }
}

.home_tagline_2 {
    border-top: none;
    padding-top: 0px;
    max-width: 560px;
    margin: 0px auto 10px auto;
    text-align: center;
    font-size: 18px;
}

.btn_text_break {
    display: inline-block;
}

.slick-prev::before,
.slick-next::before {
    font-family: 'slick';
    font-size: 20px;
    line-height: 1;
    opacity: 0.75;
    color: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>

<router>
  {
    path: '/victorian_art.html',
    caseSensitive: true,
  }
</router>
