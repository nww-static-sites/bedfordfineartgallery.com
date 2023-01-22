<template>
    <div>
        <div class="container primary">
            <section class="wrapper clearfix">
                <div class="artwork_header">
                    <h1>Art Lovers' Niche</h1>
                    <span class="hr"></span>
                </div>

                <div class="lead_callout">
                    <p
                        style="
                            text-align: center;
                            color: #222;
                            max-width: 660px;
                            margin: auto;
                            line-height: 1.4em;
                            padding-bottom: 16px;

                        "
                    >
                        Art Lovers' Niche provides you access to brief once-a-month exclusive updates. Explore unique,
                        newly discovered and featured fine art. Enter your email address below to join our mailing list:
                    </p>

                    <div class="search">
                        <form
                            id="remsform"
                            action="https://accept.nittanyweb.com/remote_add_name.cgi"
                            method="post"
                            name="remsform"
                        >
                            <input id="e" type="text" placeholder="Email Address" name="e" />
                            <input id="m2" name="m" type="hidden" value="88" />
                            <input id="l2" name="l" type="hidden" value="1263" />
                            <input
                                id="r"
                                name="r"
                                type="hidden"
                                value="https://www.bedfordfineartgallery.com/mailing_list_thanks.htm"
                            />
                            <input type="submit" value="Join the Movement" />
                        </form>
                    </div>
                    <div class="lower_content">
                    <p>"My wife is an artist, and I am a financial advisor, different in many ways. My bride has always desired a collection in fine art. My fear has always been the numbers, what am I paying for, is there an investment value, and is it a fair value? A single customer with two very different views on why to buy art. Jerry and Joan are simply amazing. Their knowledge and passion are second to none. Not only is the collection at Bedford Fine Art Gallery of museum quality, but their passion really inspires you, comforts you, and welcomes you in as a member of what seems like <span style="font-weight: bold;">an exclusive club</span>. We are blessed to know them. They will work with you in every way possible to make your dream come true. Our life is now more beautiful because of them, and we look forward to our next purchase."
<span style="font-weight: bold;">Jason and Alyson L.</span>
</p>

<p>We probably all know of an ultra-exclusive country club that provides top-tier services exceeding all others in the world.  Our customers are the best.  We really did not think about the gallery in the context of being like such an exclusive club.  The above customer’s comparison, however, may be appropriate based on our <span style="font-weight: bold;">many outstanding customers.</span></p>

<h3>Club House</h3>
<ul>
<li>Whether it is our website, Art Lovers’ Niche mailer, or the brick-and-mortar (club house!), here in Bedford, our customers have exclusive access to the best-of-the-best fine art to fall in love with.</li>
<li>We always knew our house would be the perfect venue for displaying fine art.  The lighting we use at the gallery is also used by some of the finest museums in the world, such as: Metropolitan Museum of Art, Carnegie Museum, National Gallery of Art, and the Van Gogh Museum (just to name a few).</li></ul>

<h3>Club Members</h3>
<ul>
<li>During the pandemic, Amazon reached out to Bedford Fine Art Gallery and secured six 19th century paintings for a movie they were making.  The movie is now out and is titled "Master."</li>
<li>One of the largest family-owned companies in the world (22 manufacturing facilities, 55+ retail locations, in 84 countries) purchased paintings from Bedford Fine Art Gallery for their corporate fine art collection.</li>
<li>When a major organization needed fine art for their new board room, overlooking the three rivers in Pittsburgh, PA, they purchased several paintings from Bedford Fine Art Gallery.</li>
<li>Some of the biggest fine art collectors in New York, with family members at Sotheby’s and the Metropolitan Museum of Art, have been long-time customers of Bedford Fine Art Gallery.</li>
<li>A major publisher for a new book, coming out soon, recently secured permission to use one of our paintings for the cover of the book.</li>
<li>Whether our customers (club members!) are in the art field or in another line-of-work (chocolatier, financial planner, doctor, lawyer, IT / design specialist, teacher, aerospace engineer, outstanding small-business entrepreneur, etc.), <span style="font-weight: bold;"><u>all</u> our customers are intelligent, personable, and highly successful.</span></li> </ul>
                    </div> </div>
            </section>
        </div>
        <div
            class="container footer_test"
            style="padding-top: 24px; width: 100%; margin: 0px auto; background-color: rgba(16, 88, 185, 1)"
        >
            <section class="wrapper" style="max-width: 860px; margin: auto">
                <TestimonialsScroll :testimonials="testimonials"/>
            </section>
        </div>
    </div>
</template>

<script>
import { loadShortTestimonials } from '~/libs/testimonials'

export default {
    async asyncData({ $content }) {
        return {
            testimonials: await loadShortTestimonials($content),
        }
    },
}
</script>

<style scoped>
.search {
    border: 1px solid #222;
    overflow: auto;
    border-radius: 5px;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    max-width: 550px;
    margin: 0 auto 0px auto;
}

.search input[type='text'] {
    border: 0px;
    width: 50%;
    padding: 10px 10px;
    background: #f9f9f2;
}
@media only screen and (min-width: 650px) {
    .search input[type='text'] {
        border: 0px;
        width: 70%;
        padding: 10px 10px;
        background: #f9f9f2;
    }
}

.search input[type='text']:focus {
    outline: 0;
}

.search input[type='submit'] {
    border: 0px;
    background: none;
    background-color: rgba(16, 88, 185, 1);
    color: #fff;
    float: right;
    padding: 10px;
    border-radius-top-right: 5px;
    -moz-border-radius-top-right: 5px;
    -webkit-border-radius-top-right: 5px;
    border-radius-bottom-right: 5px;
    -moz-border-radius-bottom-right: 5px;
    -webkit-border-radius-bottom-right: 5px;
    cursor: pointer;
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
.lower_content ul {
    list-style: disc;
    margin-left: 16px;
}

.lower_content li {
    font-size: 1.1em;
line-height: 1.8em;
margin-bottom: 1em;
}

.lower_content h3 {
    padding-top: 20px;
}
.lower_content h3 {
    font-weight: bold;
}
</style>

<router>
  {
    path: '/art_lovers_niche.htm',
  }
</router>
