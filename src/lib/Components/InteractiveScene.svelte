<script lang="ts">
	import { shapeInspectorStore } from '$lib/Stores/DevStore';
	import { dev } from '$app/environment';
	/**
	 * Wrapper component for the interactive for all sub components
	 * This is needed to ensure that the interactive is run at the correct time in the lifecycle
	 */
	import { interactivity } from '@threlte/extras';
	interactivity({
		filter: (hits, _state) => {
			// Only return the first hit
			if ($shapeInspectorStore.interactivityDebug) {
				console.log(hits.slice(0, 1));
			}

			return hits.slice(0, 1);
		}
	});
</script>

<svelte:window
	on:keypress={(e) => {
		if (e.key === 'i' && dev) {
			$shapeInspectorStore.interactivityDebug = !$shapeInspectorStore.interactivityDebug;
		}
	}}
/>
<slot />
