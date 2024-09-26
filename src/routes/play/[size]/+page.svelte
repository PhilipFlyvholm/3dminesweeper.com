<script lang="ts">
	import Game from '$lib/Components/game.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let { width, height, depth } = data.size;
</script>

<svelte:head>
	<title>3D Minesweeper: {width}x{height}x{depth}</title>
</svelte:head>
{#if width * height * depth > 8000}
	<!--Too big max is 20x20x20-->
	<h1 class="h1 text-center my-5 vt323">That is a too big of a cube to draw</h1>
	<p class="text-center">
		For performance reasons a limit has been set to a cube that is equilivant to 20x20x20.
	</p>
{:else}
	<Game {width} {height} {depth} />
{/if}
