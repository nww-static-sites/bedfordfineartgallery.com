<template>
    <div class="artists_navigation" role="navigation" aria-label="Artists by last name">
        <ul>
            <li v-for="letter in alphabet" :key="letter">
                <a v-if="sectionLetters.includes(letter)" :href="`#Artist-${letter}`">{{ letter }}</a>
                <span v-else role="link" aria-disabled="true">{{ letter }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        sectionLetters: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            alphabet: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
        }
    },
}
</script>
