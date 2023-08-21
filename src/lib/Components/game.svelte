<script lang="ts">
	import GameOver from '$lib/Components/overlays/GameOver.svelte';
	import Toolpicker from '$lib/Components/overlays/Toolpicker.svelte';
	import { Cube } from '$lib/Cube';
	import { gameStore, mouse } from '$lib/Stores/GameStore';
	import { imageStore } from '$lib/Stores/ImageStore';
	import { tutorialSeen } from '$lib/Stores/LocalStorage';
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { DefaultLoadingManager } from 'three';
	import GameScene from './GameScene.svelte';
	import Loading from './Loading.svelte';
	import DataOverlay from './overlays/DataOverlay.svelte';
	import TutorialOverlay from './overlays/TutorialOverlay.svelte';

	export let width = 5;
	export let height = 5;
	export let depth = 5;
	let currentTool: 'shovel' | 'flag' = 'shovel';
	let estimatedBombsRemaining = 0;
	let cube: Cube;
	let timePlayed = 0;
	let timeout: string | number | NodeJS.Timeout | undefined;
	let mounted = false;

	async function updateTime() {
		if (timeout) clearTimeout(timeout);
		if ($gameStore.startTime === null) return;
		if ($gameStore.isPlaying) timeout = setTimeout(updateTime, 1000);
		timePlayed = Date.now() - $gameStore.startTime;
	}

	function init() {
		timePlayed = 0;
		currentTool = 'shovel';

		cube = new Cube(width, height, depth);

		estimatedBombsRemaining = cube.bombs;
		$gameStore = {
			gameId: Math.random().toString(36).substring(7),
			isGameOver: false,
			isPlaying: true,
			startTime: null,
			isGameWon: false,
			clicks: 0,
			threeBV: cube.difficulty,
			size: { width, height, depth }
		};
		$imageStore = { ...$imageStore, showcaseImages: [] };
	}

	onMount(() => {
		init();
		mounted = true;
	});
	const progress = writable(0);
	const tweenedProgress = tweened($progress, {
		duration: 200
	});
	let loadingStarted = false;
	$: tweenedProgress.set($progress);
	DefaultLoadingManager.onStart = function () {
		//Do something on loading start
		console.log('Loading started');
		loadingStarted = true;
	};

	DefaultLoadingManager.onLoad = function () {
		console.log('Loading Complete!');
		$progress = 1;
	};

	DefaultLoadingManager.onProgress = function (_, itemsLoaded, itemsTotal) {
		$progress = itemsLoaded / itemsTotal;
		console.log('Loading file: ' + itemsLoaded + '/' + itemsTotal);
	};

	DefaultLoadingManager.onError = function (url) {
		console.log('There was an error loading ' + url);
	};

	setTimeout(() => {
		if (!loadingStarted && $progress === 0) {
			$progress = 1;
		}
	}, 1000);

	let isMoving = writable<'click' | 'drag' | 'none'>('none');
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="gameScreen relative h-full w-full">
	<div
		class="canvasContainer absolute h-full w-full bg-gradient-radial to-[rgb(var(--color-surface-900))] from-[rgb(var(--color-primary-500))]"
		on:mousedown={(e) => ($mouse = { x: e.clientX, y: e.clientY })}
		on:touchstart={(e) => ($mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
	>
		{#if $gameStore}
			{#key $gameStore.gameId}
				{#if $tweenedProgress < 1}
					<div
						transition:fade|local={{
							duration: 1000
						}}
						class="loadingWrapper absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-900"
					>
						<Loading enableRandomLoadingText={true} progress={$tweenedProgress * 100} />
					</div>
				{/if}

				<Canvas>
					<GameScene {isMoving} bind:estimatedBombsRemaining {cube} {updateTime} {currentTool} />
				</Canvas>
			{/key}
		{/if}
	</div>
	<Toolpicker bind:value={currentTool} />
	<DataOverlay position="left-5 bottom-5">
		<svg
			slot="icon"
			height="1em"
			viewBox="0 0 38 38"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
			<path
				d="M34.0738 3.88906L32.8492 0.482422C32.7082 0.192969 32.3965 0 32.0699 0C31.7434 0 31.4391 0.192969 31.298 0.482422L30.0734 3.88906L26.6594 5.13594C26.3402 5.25469 26.1176 5.57383 26.125 5.90781C26.125 6.2418 26.3477 6.55352 26.6594 6.66484L30.0512 7.91172L31.298 11.3109C31.4094 11.6375 31.7285 11.8676 32.0699 11.8676C32.4113 11.8676 32.7305 11.6375 32.8418 11.3109L34.0664 7.91172L37.4582 6.66484C37.7699 6.55352 37.9926 6.2418 37.9926 5.90781C37.9926 5.56641 37.7699 5.24727 37.4582 5.13594L34.0738 3.88906ZM24.2473 7.82266C23.3195 6.89492 21.8129 6.89492 20.8852 7.82266L20.6699 8.03789C19.0371 7.44414 17.2707 7.125 15.4375 7.125C6.90977 7.125 0 14.0348 0 22.5625C0 31.0902 6.90977 38 15.4375 38C23.9652 38 30.875 31.0902 30.875 22.5625C30.875 20.7293 30.5559 18.9629 29.9695 17.3301L30.1848 17.1148C31.1125 16.1871 31.1125 14.6805 30.1848 13.7527L24.2473 7.81523V7.82266ZM14.8438 14.25C10.5836 14.25 7.125 17.7086 7.125 21.9688V22.5625C7.125 23.2156 6.59062 23.75 5.9375 23.75C5.28438 23.75 4.75 23.2156 4.75 22.5625V21.9688C4.75 16.3949 9.26992 11.875 14.8438 11.875H15.4375C16.0906 11.875 16.625 12.4094 16.625 13.0625C16.625 13.7156 16.0906 14.25 15.4375 14.25H14.8438Z"
				fill="black"
			/>
		</svg>
		{estimatedBombsRemaining ?? 0}
	</DataOverlay>
	<DataOverlay position={'right-5 top-5'}>
		<svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"
			><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
				d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
			/></svg
		>
		{new Date(timePlayed).toISOString().substring(11, 19)}
	</DataOverlay>
	<GameOver restart={() => init()} {isMoving} />
	{#if mounted && $tutorialSeen === 'false'}
		<TutorialOverlay />
	{/if}
</div>

<style>
	.canvasContainer {
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
	}
</style>
