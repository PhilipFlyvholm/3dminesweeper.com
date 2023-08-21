<script lang="ts">
	import {gameStore} from '$lib/Stores/GameStore';
	import { imageStore } from '$lib/Stores/ImageStore';
	import { share } from '$lib/Utils/ShareUtil';
	import { onDestroy, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	export let restart = () => {};
	export let isMoving: Writable<"click" | "drag" | "none">;
	
	let timeDiffInSeconds = 0;
	let prettyDate = '';
	$: {
		if ($gameStore && $gameStore.endTime && $gameStore.startTime) {
			const diff = $gameStore.endTime - $gameStore.startTime;
			prettyDate = new Date(diff).toISOString().substring(11, 19);
			timeDiffInSeconds = Math.floor(diff / 1000);
		}
	}
	let efficiency = 0;
	$: efficiency =
		!$gameStore || $gameStore.clicks === 0
			? 0
			: Math.floor(($gameStore.threeBV / $gameStore.clicks) * 10000) / 100;
	let threeBVPerSecond = 0;
	$: threeBVPerSecond = !$gameStore
		? 0
		: Math.floor(($gameStore.threeBV / (timeDiffInSeconds === 0 ? 1 : timeDiffInSeconds)) * 100) /
		  100;

	

	let frameId: number = 0;
	let showcaseTimeout: NodeJS.Timer | null = null;
	onMount(() => {
		if($imageStore.showcaseMode){
			showcaseTimeout = setInterval(() => {
			 	frameId = (frameId + 1) % $imageStore.showcaseImages.length;
			}, 500);
		}
	})
	onDestroy(() => {
		if(showcaseTimeout){
			clearInterval(showcaseTimeout);
		}
	})

</script>

{#if $gameStore && $gameStore.isGameOver}
	{@const text = $gameStore.isGameWon ? 'BOMBS DEFUSED!' : 'GAME OVER!'}
	<div
		transition:fade={{ duration: 300 }}
		class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] card py-5 px-10 rounded w-[90%] sm:w-[50%] flex flex-col transition-opacity"
		style="opacity: {$isMoving === 'none' ? 1 : 0}"
	>
		{#if $imageStore.showcaseImages.length > 0}
			<img style="height:20rem; width:20rem;" src={$imageStore.showcaseImages[frameId]} alt="" />
		{/if}
		<div class="flex items-center justify-center mb-4">
			<h1 class="h1 text-center">
				{text}
			</h1>
			<img style="height:3rem; width:auto;" src={$imageStore.gameOverImage} alt="" />
		</div>
		{#if $gameStore.bombs > 0}
			<p class="card variant-soft-error mb-4 text-center flex justify-between py-2 px-4">
				Bombs remaining: <span>{$gameStore.bombs}</span>
			</p>
		{/if}
		<p class="card variant-soft-surface mb-4 text-center flex justify-between py-2 px-4">
			Time: <span>{prettyDate}</span>
		</p>
		<p class="card variant-soft-surface mb-4 text-center flex justify-between py-2 px-4">
			Clicks: <span>{$gameStore.clicks}</span>
		</p>
		<div class="card variant-soft-surface mb-4 text-center py-2 px-4">
			<p class="flex justify-between">3BV: <span>{$gameStore.threeBV}</span></p>
			{#if $gameStore.isGameWon}
				<p class="flex justify-between">3BV/sec: <span>{threeBVPerSecond}</span></p>
				<p class="flex justify-between">Efficiency: <span>{efficiency}%</span></p>
			{/if}
		</div>
		<div class="flex justify-between flex-wrap">
			<div class="m-auto w-full sm:w-[50%] mb-2 sm:mb-0 p-2">
				<button class="btn variant-filled-primary w-full" on:click={restart}>Restart</button>
			</div>
			{#if $gameStore.isGameWon}
				<div class="m-auto w-full sm:w-[50%] mb-2 sm:mb-0 p-2">
					<button class="btn variant-filled-secondary w-full" on:click={() => share(prettyDate)}>Share</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	h1,
	p {
		font-family: 'VT323', 'Alegreya Sans', sans-serif;
	}
	h1 {
		font-size: 3rem;
	}
	p {
		font-size: 1.2rem;
	}
	p span {
		font-size: 0.95rem;
		line-height: 1.95rem;
	}
</style>
