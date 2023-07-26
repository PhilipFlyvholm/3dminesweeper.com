<script lang="ts">
	import gameStore from '$lib/Stores/GameStore';
	export let restart = () => {};
	let prettyDate = '';
	$: {
		if ($gameStore && $gameStore.endTime && $gameStore.startTime) {
			prettyDate = new Date($gameStore.endTime - $gameStore.startTime)
				.toISOString()
				.substring(11, 19);
		}
	}
</script>

{#if $gameStore && $gameStore.isGameOver}
    {@const text = $gameStore.isGameWon ? 'YOU WON!' : 'GAME OVER!'}
	<div class="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] card py-5 px-10 rounded">
		<h1 class="h1" class:glitch={!$gameStore.isGameWon}>
			{text}
		</h1>
		<p>Bombs remaining: <span>{$gameStore.bombs}</span></p>
		<p>Time: <span>{prettyDate}</span></p>
		<p>Clicks: <span>{$gameStore.clicks}</span></p>
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
