<script lang="ts">
	import type { UpdatedScores } from '$lib/Leaderboard';
	import { gameStore } from '$lib/Stores/GameStore';
	import { scale } from 'svelte/transition';
	type updatedScoreKeys = keyof UpdatedScores;
	export let store: updatedScoreKeys;
	export let field: 'time' | 'clicks' | 'threeBV' | 'efficiency';
	let isNewPb = false;
	$: {
		if (!$gameStore || !$gameStore.isGameWon || $gameStore.score.updated[store] == undefined) {
			isNewPb = false;
		} else {
			const updatedStore = $gameStore.score.updated[store];
			if (updatedStore === undefined) isNewPb = false;
			else isNewPb = updatedStore[field];
		}
	}
</script>

{#if isNewPb}
	<span
		in:scale={{ delay: Math.random() * 1000, duration: 300 }}
		class="badge animate-pulse font-normal mr-2 text-white-500 variant-filled-secondary"
		style={'rotate: ' + Math.round(Math.random() * 8 - 4) + 'deg'}>New PB</span
	>
{/if}
