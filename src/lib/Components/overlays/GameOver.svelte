<script lang="ts">
	import { gameStore } from '$lib/Stores/GameStore';
	import { imageStore } from '$lib/Stores/ImageStore';
	import { createShareableImage } from '$lib/Utils/ImageUtil';
	import { share } from '$lib/Utils/ShareUtil';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import PbBagde from '../Badges/PBBagde.svelte';

	export let restart = () => {};
	export let isMoving: Writable<'click' | 'drag' | 'none'>;

	let timeDiffInSeconds = 0;
	let prettyDate = '';
	$: {
		if ($gameStore && $gameStore.endTime && $gameStore.startTime) {
			const diff = $gameStore.endTime - $gameStore.startTime;
			prettyDate = new Date(diff).toISOString().substring(11, 19);
			timeDiffInSeconds = Math.floor(diff / 1000);
		}
	}

	let frameId: number = 0;
	type Timeout = string | number | NodeJS.Timeout | undefined;
	let showcaseTimeout: Timeout = undefined;
	let shareableImage = writable('');
	onMount(async () => {
		if ($imageStore.showcaseMode) {
			showcaseTimeout = setInterval(() => {
				frameId = (frameId + 1) % $imageStore.showcaseImages.length;
			}, 500);
		}
	});
	onDestroy(() => {
		if (showcaseTimeout) {
			clearInterval(showcaseTimeout);
		}
	});
	const drawerStore = getDrawerStore();

	gameStore.subscribe(async (gameStore) => {
		if (gameStore && gameStore.isGameOver && gameStore.isGameWon) {
			imageStore.subscribe(async (value) => {
				let timeUsed = '';
				if (gameStore.endTime && gameStore.startTime) {
					const diff = gameStore.endTime - gameStore.startTime;
					timeUsed = new Date(diff).toISOString().substring(11, 19);
				}
				createShareableImage(
					timeUsed,
					gameStore.clicks,
					gameStore.threeBV,
					gameStore.score.current.efficiency,
					gameStore.score.current.threeBVPerSecond
				).then((image) => {
					shareableImage.set(image);
					console.log('shareable image created');
				});
			});
		}
	});
</script>

{#if $gameStore && $gameStore.isGameOver && (!$gameStore.isGameWon || $shareableImage !== '')}
	{@const text = $gameStore.isGameWon ? 'BOMBS DEFUSED!' : 'GAME OVER!'}
	<div
		transition:fade={{ duration: 300 }}
		class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] card py-5 px-10 rounded w-[90%] sm:w-[50%] flex flex-col transition-opacity"
		style="opacity: {$isMoving === 'none' ? 1 : 0}"
	>
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
			Time: <span> <PbBagde store="local" field="time" />{prettyDate}</span>
		</p>
		<p class="card variant-soft-surface mb-4 text-center flex justify-between py-2 px-4">
			Clicks: <span><PbBagde store="local" field="clicks" />{$gameStore.clicks}</span>
		</p>
		<div class="card variant-soft-surface mb-4 text-center py-2 px-4">
			<p class="flex justify-between">
				3BV: <span><PbBagde store="local" field="threeBV" />{$gameStore.threeBV}</span>
			</p>
			{#if $gameStore.isGameWon}
				<p class="flex justify-between">
					3BV/sec: <span>{$gameStore.score.current.threeBVPerSecond}</span>
				</p>
				<p class="flex justify-between">
					Efficiency: <span
						><PbBagde store="local" field="efficiency" />{$gameStore.score.current
							.efficiency}%</span
					>
				</p>
			{/if}
		</div>
		<div class="flex justify-between flex-wrap">
			<div class="m-auto w-full sm:w-[50%] mb-2 sm:mb-0 p-2">
				<button class="btn variant-filled-primary w-full" on:click={restart}>Restart</button>
			</div>
			{#if $gameStore.isGameWon}
				<div class="m-auto w-full sm:w-[50%] mb-2 sm:mb-0 p-2">
					<button
						class="btn variant-filled-secondary w-full"
						on:click={() => share(prettyDate, drawerStore, $shareableImage)}>Share</button
					>
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
