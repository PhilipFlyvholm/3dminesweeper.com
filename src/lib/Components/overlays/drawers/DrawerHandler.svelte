<script lang="ts">
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import ShareDrawer from './share/ShareDrawer.svelte';
	import { shareId as shareDrawerId } from './share/ShareDrawerSettings';

	const drawerStore = getDrawerStore();
	let drawer: HTMLElement | null = null;
	let initial = { x: 0, y: 0, height: 0 };
	function handleMouseDown(e: CustomEvent<MouseEvent>) {
		drawer = document.querySelector('.drawer');
		if (!drawer) return;
		initial = {
			x: e.detail.clientX,
			y: e.detail.clientY,
			height: drawer.getBoundingClientRect().height
		};
		drawer.style.transition = '.1s ease-out';
		drawer.style.overflow = 'unset';
		drawer.style.height = `${initial.height}px`;
		drawer.style.transform = `translateY(0)`;
		console.log(e);

	}

	function handleMouseMove(e: MouseEvent) {
		if (!drawer) return;
		drawer.style.overflow = 'hidden';

		if (initial.y - e.clientY < 0) {
			drawer.style.transform = `translateY(${e.clientY - initial.y}px)`;
			drawer.style.height = `${initial.height}px`;
		} else {
			drawer.style.transform = `translateY(0)`;
			let diff = (initial.y - e.clientY);
			if(diff > initial.height*0.2){
				diff = initial.height*0.2;
			}
			drawer.style.height = `${initial.height + diff}px`;
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (!drawer) return;
		if (initial.y - e.clientY < initial.height / 2) {
			drawerStore.close();
		} else {
			drawer.style.overflow = 'unset';
			drawer.style.height = `${initial.height}px`;
			drawer.style.transform = `translateY(0)`;
		}
		drawer = null;
		initial = { x: 0, y: 0, height: 0 };
	}

	function handleBackdrop(e: CustomEvent<MouseEvent>) {
		if(!drawer) return;
		e.preventDefault();
	}
</script>

<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />
<Drawer on:drawer={handleMouseDown} on:backdrop={handleBackdrop}>
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
