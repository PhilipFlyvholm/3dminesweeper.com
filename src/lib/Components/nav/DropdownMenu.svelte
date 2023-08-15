<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	const uniqueId = Math.random().toString(36).substring(2, 11);
	const popupCombobox: PopupSettings = {
		event: 'click',
		target: `popupCombobox-${uniqueId}`,
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};
</script>

<button class="btn variant-soft justify-between" use:popup={popupCombobox}>
	<span class="capitalize">New game</span>
	<span>↓</span>
</button>
<div class="card w-48 shadow-xl py-2" data-popup="popupCombobox-{uniqueId}">
	<a href="/play/3x3x3" data-sveltekit-reload class="px-4 py-2 hover:variant-soft w-full block"
		>New 3x3x3 game</a
	>
	<a href="/play/5x5x5" data-sveltekit-reload class="px-4 py-2 hover:variant-soft w-full block"
		>New 5x5x5 game</a
	>
	<a href="/play/10x10x10" data-sveltekit-reload class="px-4 py-2 hover:variant-soft w-full block"
		>New 10x10x10 game</a
	>
	<div class="arrow bg-surface-100-800-token" />
</div>
