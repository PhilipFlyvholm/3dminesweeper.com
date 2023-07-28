<script lang="ts">
	import gameStore from '$lib/Stores/GameStore';
	export let restart = () => {};
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
</script>

{#if $gameStore && $gameStore.isGameOver}
	{@const text = $gameStore.isGameWon ? 'YOU WON!' : 'GAME OVER!'}
	<div
		class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] card py-5 px-10 rounded"
	>
		<h1 class="h1" class:glitch={!$gameStore.isGameWon}>
			{text}
		</h1>
		{#if $gameStore.bombs > 0}
			<p>Bombs remaining: <span>{$gameStore.bombs}</span></p>
		{/if}
		<p>Time: <span>{prettyDate}</span></p>
		<p>Clicks: <span>{$gameStore.clicks}</span></p>
		<p>3BV: <span>{$gameStore.threeBV}</span></p>
		{#if $gameStore.isGameWon}
			<p>3BV/sec: <span>{threeBVPerSecond}</span></p>
			<p>Efficiency: <span>{efficiency}%</span></p>
		{/if}
		<br />
		<button class="btn variant-filled-primary w-full" on:click={restart}>Restart</button>
	</div>
{/if}

<style>
	h1,
	p {
		font-family: 'VT323';
	}
</style>
