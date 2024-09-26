<script>
	// Finally, your application's global stylesheet (sometimes labeled 'app.css')
	import Footer from '$lib/Components/nav/footer.svelte';
	import Header from '$lib/Components/nav/header.svelte';
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { AppShell, Drawer, Toast } from '@skeletonlabs/skeleton';
	import '../app.postcss';

	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	//Vercel Analytics
	import { dev } from '$app/environment';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { inject } from '@vercel/analytics';
	import DrawerHandler from '$lib/Components/overlays/drawers/DrawerHandler.svelte';

	inject({ mode: dev ? 'development' : 'production' });
	initializeStores();
</script>

<svelte:head>
	<title>3D Minesweeper - Play Minesweeper in a new dimension</title>
</svelte:head>
<Toast />
<DrawerHandler />
<AppShell>
	<svelte:fragment slot="pageHeader"><Header /></svelte:fragment>
	<slot />
	<svelte:fragment slot="pageFooter"><Footer /></svelte:fragment>
</AppShell>

<style>
	:global(h1, .vt323) {
		font-family: 'VT323', 'Alegreya Sans', sans-serif;
		text-shadow:
			2px 2px 0px #744aa1,
			3px 3px 0px #744aa1;
	}

	:global(h2, h3) {
		font-weight: bold;
		margin: 1rem 0 0.25rem 0;
	}
	:global(strong) {
		display: block;
		margin: 1rem 0 0.25rem 0;
	}
</style>
