<script lang="ts">
	import { getDrawerStore, Drawer } from '@skeletonlabs/skeleton';
	import ShareDrawer from './share/ShareDrawer.svelte';
	import { shareId as shareDrawerId } from './share/ShareDrawerSettings';

	const drawerStore = getDrawerStore();
</script>

<Drawer>
	{#if $drawerStore.id === shareDrawerId}
        <ShareDrawer />
	{:else}
		<!-- Fallback Error -->
		<div class="w-full h-full flex justify-center items-center">
			<div class="text-center space-y-2">
				<p>Hmm... It does not seem like I should have showed you this?</p>
                <button class="btn btn-primary" on:click={() => drawerStore.close()}>Close</button>
			</div>
		</div>
	{/if}
</Drawer>