<script lang="ts">
	import {gameStore} from '$lib/Stores/GameStore';
	import { imageStore } from '$lib/Stores/ImageStore';
	import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';
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

	function dataURLtoFile(dataurl: string, filename: string) {
		let arr = dataurl.split(',');
		if (arr.length < 2) return null;
		let mime = arr[0].match(/:(.*?);/);
		if (!mime) return null;
		let bstr = atob(arr[arr.length - 1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime[1] });
	}
	function createToast(message: string, isError = false) {
		const t: ToastSettings = {
			message: message,
			background: isError ? 'variant-filled-error' : undefined
		};

		// Trigger the toast:
		toastStore.trigger(t);
	}

	function share() {
		if (!$gameStore || !$gameStore.isGameOver || !$gameStore.isGameWon) return;
		const time = prettyDate.split(':');
		const hours = parseInt(time[0]);
		const minutes = parseInt(time[1]);
		const seconds = parseInt(time[2]);
		const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${
			seconds > 0 ? seconds + 's' : ''
		}`;

		const message = `I just played 3D Minesweeper and cleared a ${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth} in ${timeString}!`;
		if (navigator.canShare) {
			console.log('Sharing');

			const file = $imageStore.gameOverImage !== '' ? dataURLtoFile($imageStore.gameOverImage, '3dminesweeper.png') : null;
			const title = '3D Minesweeper';
			const url = 'https://3dminesweeper.com';
			let shareObject: {
				title: string;
				url: string;
				text?: string;
				files?: File[];
			} = {
				title: title,
				url: url
			};

			if (
				file &&
				navigator.canShare({
					...shareObject,
					text: message,
					files: file ? [file] : undefined
				})
			) {
				shareObject = {
					...shareObject,
					text: message,
					files: file ? [file] : undefined
				};
			} else if (
				navigator.canShare({
					...shareObject,
					text: message
				})
			) {
				shareObject = {
					...shareObject,
					text: message
				};
			}
			navigator
				.share(shareObject)
				.then(() => {
					createToast('Successfully shared!');
					console.log('Share was successful.');
				})
				.catch((error) => {
					createToast('Something went wrong during sharing', true);
					console.log('Sharing failed', error);
				});
		} else {
			//Copy to clipboard

			console.log('Copying to clipboard');
			const url = `https://3dminesweeper.com/play/${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth}`;
			const string = message + ` Try to beat me at ${url}`;
			if(navigator.clipboard){
				navigator.clipboard.writeText(string);
				createToast('Copied to clipboard!');
			}else{
				createToast('Failed to copy to clipboard', true)
			}
				
		}
	}

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
					<button class="btn variant-filled-secondary w-full" on:click={share}>Share</button>
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
