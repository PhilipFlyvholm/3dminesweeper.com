<script>
	import VideoLink from '$lib/Components/frontpage/videoLink.svelte';
</script>

<h1 class="h1 text-center my-5">3D Minesweeper</h1>
<div class="flex flex-wrap justify-between w-[70%] md:w-[80%] lg:w-[70%] m-auto">
	<VideoLink sources={["/videos/3x3x3-edited.webm"]} href="/play/3x3x3" text="3x3x3" />
	<VideoLink sources={["/videos/5x5x5-edited.webm"]} href="/play/5x5x5" text="5x5x5" />
	<VideoLink sources={["/videos/10x10x10-edited.webm"]} href="/play/10x10x10" text="10x10x10" />
</div>

<!--<Game />
-->
<style>
	:global(h1, .vt323),
	h1 {
		font-family: 'VT323';
	}
</style>
