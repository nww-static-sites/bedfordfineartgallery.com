<template>
    <div class="artwork_header">
        <h1>
            <span class="artistTitle">{{ artistNameWithTinyDescription }}</span>
            <span v-if="painting.artist.alias" class="alias"
                >(&nbsp;&nbsp;aka&nbsp;&nbsp;{{ painting.artist.alias }}&nbsp;&nbsp;)</span
            >
            {{ painting.title }}
        </h1>

        <p v-if="painting.dimensions" class="dimensions">{{ painting.dimensions }}</p>

        <span class="hr"></span>
      <p style="text-align: center; font-weight: bold; font-size: 18px; padding-top: 1rem;">Take a moment with this painting. Notice what it stirs in you. Not decor, but a story you get to keep looking at. This is the piece people ask about the moment they walk in.</p>
    </div>
</template>

<script>
import { artistNameWithTinyDescription } from '~/libs/artist'

export default {
    props: {
        painting: {
            type: Object,
            required: true,
        },
    },
	computed: {
        artistNameWithTinyDescription() {
            return artistNameWithTinyDescription(this.painting.artist)
        },
	}
}
</script>
