<script>
	import { dev } from '$app/environment';
    import { shapeInspectorStore } from '$lib/Stores/DevStore';
	if (dev) {
		//do in dev mode
	}
</script>

{#if dev}
    <div class="badge variant-filled-primary py-1 px-2 absolute flex gap-1">
        <label for="EnableSplitCheckbox">Enable split? {$shapeInspectorStore.enableSplit}</label>
        <input type="checkbox" id="EnableSplitCheckbox" bind:checked={$shapeInspectorStore.enableSplit}>
        <label for="SplitAtRange">SplitAt:  {$shapeInspectorStore.splitAt}</label>
        <input type="range" min="0" max="10" class="slider" bind:value={$shapeInspectorStore.splitAt} id="SplitAtRange">
    </div>
{/if}