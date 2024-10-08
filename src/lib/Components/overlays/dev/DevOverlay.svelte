<script>
	import { PerfMonitor } from '@threlte/extras';
	import { dev } from '$app/environment';
	import { devMode } from '$lib/Stores/DevStore';
</script>

<svelte:window
	on:keypress={(e) => {		
		if (e.key.toLowerCase() === 'd' && e.shiftKey && dev) {
			$devMode = !$devMode;
		}
	}}
/>
{#if dev}
	{#if $devMode}
		<PerfMonitor anchorX={'left'} anchorY={'bottom'} logsPerSecond={30} />
	{/if}
{/if}
