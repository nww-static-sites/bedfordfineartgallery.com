<template>
    <div>
<div class="container primary">
<section class="wrapper clearfix">
<div class="artwork_header"><h1>Stop. Visit. Celebrate!</h1>
<!--<h2>How to find us</h2>--><span class="hr"></span></div>

<div class="col_flex">
<div class="col_40_flex">


<nuxt-img provider="cloudinary" loading="lazy" class="art_detail" style="width: 100%; height:auto;" src="visit_gallery.jpg" width="587" height="725" alt="Bedford Fine Art Gallery
"/></div>

<div class="col_60_flex artwork_details">
<h4>Business Hours</h4>
<p>Open Monday - Saturday 10am - 5pm<br>
Sunday hours by appointment: call 724-459-0612</p>
<h4>Call Us</h4>
<p>Please call  724-459-0612 to schedule an appointment anytime at your convenience.  Thank you for choosing Bedford Fine Art Gallery as your gallery of choice.  </p>


<h4>our Address</h4>
<p>230 South Juliana St.<br>
Bedford PA 15522<br>
<iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d6111.283002318528!2d-78.50823720915139!3d40.0164547085346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x89ca5259554ad163%3A0xe6062281f0ec6f2f!2s230+S+Juliana+St%2C+Bedford%2C+PA+15522!3m2!1d40.0164548!2d-78.5036238!5e0!3m2!1sen!2sus!4v1444137907050" width="600" height="450" frameborder="0" style="border:0; width: 100%; height:auto; margin-top: 8px;" allowfullscreen></iframe>
</p>
</div>

</div>

<!-- testimonials mobile -->
<div class="container" style="padding-top: 24px; width: 100%; margin:0px auto; background-color: rgba(16,88,185,1.00);margin-top: 24px;border-radius: 6px;">
<section class="wrapper" style="max-width: 860px; margin:auto;">

<div class="home_test">
                    <TestimonialsScroll :testimonials="testimonials" />
                </div>

</section>
</div>
<!-- end testimonials mobile -->
<div class="artwork_header"><h2 style="padding: 32px 0px 0px 0px;">Bedford, Pennsylvania</h2></div>
<div class="bedford_banner">
  <nuxt-img provider="cloudinary" loading="lazy" style="width: 100%; height:auto; display:block;" src="small_town.jpg" width="1868" height="414" alt=""/> </div>

   <div class="breadcrumb desktop_hide" style="margin-top: 15px; margin-bottom: 32px">
                            <a href="https://visitbedfordcounty.com/" target="_blank">
                        Bedford County Visitors Bureau</a>
                        </div>
  <p class="oblique" style="margin-bottom: 1em; margin-top: 1em; font-weight: bold;">
                        Take a virtual tour of our gallery
                    </p>
<div class="vid_max">
<div id="video_anchor" class="video-container" style="margin: 0px auto 30px auto; width: 90%">
                        <YouTubeVideo link="https://www.youtube.com/embed/iQuzsnwvbM8?rel=0"/>
                    </div>

</div>

<div class="places_to_stay">
<p class="oblique" style="margin-bottom: 1em; margin-top: 1em; font-weight: bold;">Some great historical places to stay in Bedford:</p>
<ul>
<li><nuxt-img provider="cloudinary" loading="lazy" src="bsr2.jpg" width="646" height="430" alt=""/>
<p>Omni Bedford Spring Resort</p>
</li>
<li><nuxt-img provider="cloudinary" loading="lazy" src="Blue_Moon_Bedford.jpg" width="646" height="430" alt="Blue Moon Bed and Breakfast
"/>
<p>Blue Moon Bed and Breakfast</p>
</li>
<li><nuxt-img provider="cloudinary" loading="lazy" src="Chancellors_House.jpg" width="646" height="430" alt="The Chancellor's House
"/>
<p>The Chancellor's House</p>
</li>
<li><nuxt-img provider="cloudinary" loading="lazy" src="Golden_Eagle_Inn.jpg" width="646" height="430" alt="The Golden Eagle Inn
"/>
<p>The Golden Eagle Inn</p>
</li>
<li><nuxt-img provider="cloudinary" loading="lazy" src="Jean_Bonnet_Tavern.jpg" width="646" height="430" alt="Jean Bonnet Tavern
"/>
<p>Jean Bonnet Tavern</p>
</li>
<li><nuxt-img provider="cloudinary" loading="lazy" src="pigeon_loft.jpg" width="646" height="430" alt="Pigeon Loft
"/>
<p>Pigeon Loft</p>
</li>

</ul>

</div>

<div class="visit_articles">
<div class="visit_flex">
<div class="visit_flex_thumb"><nuxt-link to="highlights_article_7.html"><nuxt-img provider="cloudinary" loading="lazy" src="bedford_sign.jpg" width="308" height="294" alt="Bedford Fine Art Gallery
" style="width: 100%; height:auto; border:1px solid #222222;"/></nuxt-link></div>
<div><h2 style="text-align:left;">Destination</h2>
<p>The Bedford Fine Art Gallery is "The Destination" not just an attraction along the way. The artworks presented in the Gallery are period originals, not copies, prints or other modes of imitation that exemplify the skill of the original artist, not that of the machine, which is a mere mechanical copyist.</p>

<p><nuxt-link class="readmore" to="highlights_article_7.html">Read More</nuxt-link></p>




</div></div>


<div class="visit_flex">

<div class="visit_flex_thumb"><nuxt-link to="highlights_article_6.html"><nuxt-img provider="cloudinary" loading="lazy" src="location.png" width="1213" height="226" alt="Location. Location. Location.
" style="width: 100%; height:auto; border:1px solid #222222;"/></nuxt-link></div>
<div><h2 style="text-align:left;">Location. Location. Location.</h2><p>For approximately 250 years, Bedford has been a welcome stopping place for travelers.  Presidents and

soldiers, Indian traders and the first colonists of the west, all paused here.</p>

<p><nuxt-link class="readmore" to="highlights_article_6.html">Read More</nuxt-link></p>


</div></div>

<div class="visit_flex">

<div class="visit_flex_thumb"><nuxt-link to="highlights_article.html"><nuxt-img provider="cloudinary" loading="lazy" src="legacy.jpg" width="412" height="216" alt="19th Century Fine Art Legacy
" style="width: 100%; height:auto; border:1px solid #222222;"/></nuxt-link></div>
<div><h2 style="text-align:left;">19th Century Fine Art Legacy</h2><p>The land upon which the Barclay house is built was part of a larger land grant given to Colonel Hugh

Barclay by William Penn.  Hugh Barclay, who served during the Revolutionary War, was Bedford’s first Post

Master and patriarch of the Barclay family.  The Barclay family rose to prominence in Bedford in the century

following the war.</p>

<p><nuxt-link class="readmore" to="highlights_article.html">Read More</nuxt-link></p>


</div></div>

<div class="visit_flex">

<div class="visit_flex_thumb"><nuxt-link to="highlights_article_21.html"><nuxt-img provider="cloudinary" loading="lazy" src="architecture.jpg" width="412" height="216" alt="Geology and Landscape Art in 19th Century America
" style="width: 100%; height:auto; border:1px solid #222222;"/></nuxt-link></div>
<div><h2 style="text-align:left;">Bedford Fine Art Gallery's Architectural Venue</h2><p>The Barclay Mansion was built in 1889, during the late Victorian period. Although the house is Victorian

in age, it is reminiscent of the Renaissance Classical tradition with Italianate style details.</p>

<p><nuxt-link class="readmore" to="highlights_article_21.html">Read More</nuxt-link></p>


</div></div>

<div class="visit_flex">

<div class="visit_flex_thumb"><nuxt-link to="highlights_article_20.html"><nuxt-img provider="cloudinary" loading="lazy" src="victorian.jpg" width="412" height="216" alt="Geology and Landscape Art in 19th Century America
" style="width: 100%; height:auto; border:1px solid #222222;"/></nuxt-link></div>
<div><h2 style="text-align:left;">Victorian Homes and Fine Art</h2><p>Each person is unique and stands apart from others; there will never be another “you”…at least

for a long, long time.  For the time being, you are one of a kind.</p>

<p><nuxt-link class="readmore" to="highlights_article_20.html">Read More</nuxt-link></p>


</div>
</div>

</div>

<div class="visit_social">

<div>
                        <h2
                            style="
                                color: #742924;
                                text-transform: capitalize;
                                text-align: center;
                                padding: 10px;
                                font-size: 20px;
                                font-weight: bold;
                            "
                        >
                            Art Lovers' Niche
                        </h2>
                        <div class="video-container">
                            <YouTubeVideo link="https://www.youtube.com/embed/oY3C5t3A1zQ?rel=0" />
                        </div>
                        <div class="breadcrumb desktop_hide" style="margin-top: 15px; margin-bottom: 15px">
                            <nuxt-link :to="{ name: 'art-lovers-niche' }"
                        >Join us at art lovers' niche<br />don't miss out!</nuxt-link>
                        </div>
                    </div>
                    <div>
                        <h2
                            style="
                                color: #742924;
                                text-transform: capitalize;
                                text-align: center;
                                padding: 10px;
                                font-size: 20px;
                                font-weight: bold;
                            "
                        >
                            Instagram
                        </h2>
                        <a href="https://www.instagram.com/bedfordfineartgallery/" target="_blank"
                            ><nuxt-img provider="cloudinary" src="instagram_invite.jpg" width="675" height="525" alt=""
                        /></a>
                        <div class="breadcrumb desktop_hide" style="margin-top: 15px; margin-bottom: 15px">
                            <a href="https://www.instagram.com/bedfordfineartgallery/" target="_blank"
                                >Follow us on Instagram</a
                            >
                        </div>
                    </div>

                            <div>
                        <h2
                            style="
                                color: #742924;
                                text-transform: capitalize;
                                text-align: center;
                                padding: 10px;
                                font-size: 20px;
                                font-weight: bold;
                            "
                        >
                           Matt Otis and the Sound - Home (Bedford, PA)
                        </h2>
                        <div class="video-container" style="clear: both">
                        <YouTubeVideo link="https://www.youtube.com/embed/2NL4upjtDFs?rel=0"/>
                    </div>

                    </div>

                         <div>
                        <h2
                            style="
                                color: #742924;
                                text-transform: capitalize;
                                text-align: center;
                                padding: 10px;
                                font-size: 20px;
                                font-weight: bold;
                            "
                        >
                            Bedford County, PA
                        </h2>
                        <div class="video-container">
                            <YouTubeVideo link="https://www.youtube.com/embed/2bkeSQvpgzk?rel=0" />
                        </div>

                    </div>
                </div>

                <div class="interesting_links" style="padding-top: 32px;">

<h4>Interesting Links</h4>
                        <a
                            href="http://www.visitbedfordcounty.com/shopping/"
                            target="_blank"
                            rel="nofollow"
                            style="color: #000000"
                            ><nuxt-img provider="cloudinary"
                                style="width: 100%; height: auto; max-width: 120px"
                                class="social2"
                                src="/images/bcvb.png"
                                width="220"
                                height="100"
                                alt=""
                            /><br />Member of the Bedford County Visitors Bureau</a
                        >
                        <p style="margin-top: 16px; margin-bottom: 0px; padding-bottom: 6px; display:none;">
                            Bedford Fine Art Gallery is a member of the
                            <a
                                style="color: #000000"
                                rel="nofollow"
                                href="http://www.bedfordbusinessdirectory.com/"
                                target="_blank"
                                >Bedford Business Directory</a
                            >.
                        </p>

                        <p style="margin-top: 4px; margin-bottom: 0px">
                            <a
                                href="http://solux.net/cgi-bin/tlistore/infopages/index.html"
                                target="_blank"
                                style="color: #000000"
                                rel="nofollow"
                                >SoLux Lighting</a
                            >
                        </p>
                        <p style="margin-top: 4px; margin-bottom: 0px">
                            <a href="http://www.ushistory.org/" target="_blank" style="color: #000000" rel="nofollow"
                                >ushistory.org</a
                            >
                        </p>

                </div>

</section>
</div>
    </div>
</template>

<script>
import YouTubeVideo from '~/components/YouTubeVideo'
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    components: { YouTubeVideo },
    async asyncData({ $content }) {
        return {
            testimonials: await loadShortTestimonials($content),
        }
    },
}
</script>

<style scoped>
.artwork img {
    width: 90%;
    height: auto;
}
.video-container {
    position: relative;
    padding-bottom: 0;
    padding-top: 0;
    height: auto;
    overflow: visible;
}

.col_flex,
.visit_flex {
    display: flex;
    justify-content: space-between;
    gap: 40px;

    flex-direction: row;
}
.col_flex > * {
    flex: 1;
}
.places_to_stay,
.vid_max,
.visit_articles {
    max-width: 900px;
    margin: auto;
}

.places_to_stay ul,
.visit_flex,
.visit_social {
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 20px;
}
.places_to_stay img {
    width: 100%;
    height: auto;
}
.places_to_stay ul li {
    text-align: center;
}
.places_to_stay p {
    padding-top: 8px;
}
.visit_flex {
    border-bottom: 1px solid #cdc396;
    padding-bottom: 20px;
    margin: 32px auto 20px auto;
    max-width: 800px;
}
.visit_flex img {
    max-width: 300px;
}

@media only screen and (max-width: 760px) {
    .col_flex,
    .places_to_stay ul,
    .visit_flex {
    }
    .visit_flex {
        gap: 0px;
    }

    .places_to_stay ul,
    .visit_flex,
    .visit_social {
        grid-template-columns: 1fr;
    }
}

.readmore {
    background-color: #681d1e;
    color: #f2f2f2;
    padding: 12px;
    text-decoration: none;
    margin-top: 16px;
    display: inline-block;
    font-size: 18px;
    text-transform: uppercase;
    border-radius: 4px;
}

.bedford_banner {
    padding-bottom: 10px;
}
.visit_social img {
    width: 100%;
    height: auto;
    max-width: 426px;
    margin: auto;
    display: block;
}
</style>

<router>
  {
    path: '/Directions.html'
  }
</router>
