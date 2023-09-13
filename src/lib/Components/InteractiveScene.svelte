<script lang="ts">
	/**
	 * Wrapper component for the interactive for all sub components
	 * This is needed to ensure that the interactive is run at the correct time in the lifecycle
	 */
	import { interactivity } from '@threlte/extras';
	interactivity({
		filter: (hits, state) => {			
			// Only return the first hit
			return hits.slice(0, 1);
		}
	});
</script>

<slot />
