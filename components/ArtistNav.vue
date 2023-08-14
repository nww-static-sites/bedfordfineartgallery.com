<template>
	<div class="artists_navigation">
		<ul>
			<li v-for="letter in alphabet" :key="letter">
				<a :href="`#Artist-${letter}`">{{ letter }}</a>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	data() {
		return {
			alphabet: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
		}
	}
}
</script>