<script lang="ts">
	export let sources:string[] = [];
    export let text = ''
	export let href = '';
	export let poster:string | undefined = undefined;

	let video: HTMLVideoElement;

	function play() {
		video.play();
	}
	function stop() {
		//Set video to beginning
		video.currentTime = 0;
		video.pause();
	}
</script>

<a
	class="border-8 border-primary-500 rounded relative w-full sm:w-[30%] m-5 sm:m-0"
	on:mouseenter={play}
	on:mouseleave={stop}
	href={href}
>
	<video style="width: 100%;" muted loop bind:this={video} poster={poster}>
		{#each sources as src}
			{@const type = src.split(".")[src.split(".").length-1]}
			<source src={src} type="video/{type}" />
		{/each}
		<track kind="captions" />
	</video>
	<div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
        <p class="vt323 text-lg">{text}</p>
    </div>
</a>

<style>
	video::-webkit-media-controls {
		display: none !important;
	}
</style>
