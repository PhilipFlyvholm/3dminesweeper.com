<script>
	// Your selected Skeleton theme:
	import '@skeletonlabs/skeleton/themes/theme-gold-nouveau.css';
	// This contains the bulk of Skeletons required styles:
	import '@skeletonlabs/skeleton/styles/skeleton.css';

	// Finally, your application's global stylesheet (sometimes labeled 'app.css')
	import '../app.postcss';
	import { AppShell, Toast } from '@skeletonlabs/skeleton';
	import Header from '$lib/Components/nav/header.svelte';
	import Footer from '$lib/Components/nav/footer.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	//Vercel Analytics
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<svelte:head>
	<title>3D Minesweeper - Play Minesweeper in a new dimension</title>
</svelte:head>
<Toast />
<AppShell>
	<svelte:fragment slot="pageHeader"><Header /></svelte:fragment>
	<slot />
	<svelte:fragment slot="pageFooter"><Footer /></svelte:fragment>
</AppShell>

<style>
	:global(h1, .vt323) {
		font-family: 'VT323', 'Alegreya Sans', sans-serif;
		text-shadow: 2px 2px 0px #744aa1, 3px 3px 0px #744aa1;
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
