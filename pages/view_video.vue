<template>
    <div>
<div class="container primary">
<section class="wrapper clearfix">
<div class="artwork_header">
  <h1>Dr. Terri Nicole Sawyer</h1>
  <span class="hr"></span></div>


<div>

<div style="max-width:750px; margin:auto;">
<div class="video-container">
<YouTubeVideo link="https://www.youtube.com/embed/cFAempT0P1Y?rel=0" />

</div>


<div class="breadcrumb"><a href="Artists--Bios.html" class="content_btn">view our gallery</a></div>

</div>
</div>

</section>
</div>
    </div>
</template>

<script>
import YouTubeVideo from '~/components/YouTubeVideo'

export default {
    head() {
        return {
            title: "Dr. Terri Nicole Sawyer on Bedford Fine Art Gallery",
            meta: [{ hid: 'description', name: 'description', content: "Watch Dr. Terri Nicole Sawyer discuss Bedford Fine Art Gallery. The video presents her perspective on the gallery’s work with collectors." }],
        }
    },
  components: { YouTubeVideo },
}
</script>

<style>
.y-video__media--type--img {
  -o-object-fit: cover;
  object-fit: cover;
}
</style>

<router>
  {
    path: '/view_video.html',
  }
</router>