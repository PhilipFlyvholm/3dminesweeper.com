<script lang="ts">
	import { createToast } from '$lib/Utils/ToastUtil';
	import Icon from '@iconify/svelte';
	import { getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { ShareData } from './ShareDrawerSettings';
	import SocialShareButton from './SocialShareButton.svelte';
	import { shareProviders } from './providers';
	const drawerStore = getDrawerStore();
	const toastStore = getToastStore();

	const shareData = $drawerStore.meta as ShareData;
	function handleClipboardCopy() {
		console.log('Copying to clipboard');
		if (navigator.clipboard && shareData.clipboardMessage) {
			navigator.clipboard.writeText(shareData.clipboardMessage);
			createToast(toastStore, 'Copied to clipboard!');
		} else {
			createToast(toastStore, 'Failed to copy to clipboard', true);
		}
		drawerStore.close();
	}
	const toBase64 = (file?: File) =>
		new Promise<string>((resolve, reject) => {
			if (!file) {
				resolve('');
				return;
			}
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
		});

	function handleDownload(): any {
		const link = document.createElement('a');
		link.href = shareData.files ? URL.createObjectURL(shareData.files[0]) : '';
		link.download = 'minesweeper.png';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="py-4 flex flex-col items-center">
	<div class="handle w-10 h-2 bg-[#D4D4D8] rounded-full my-2" />
	<div class="flex gap-5 mx-auto max-w-full overflow-x-auto my-5 px-4 md:px-8">
		{#each shareProviders as provider}
			<SocialShareButton
				name={provider.name}
				icon={provider.icon}
				link={provider.getShareUrl(shareData)}
			/>
		{/each}
	</div>
	<div class="spacer w-full h-[1px] bg-[#D4D4D8] my-2" />
	{#if shareData.files && shareData.files.length > 0}
		<button
			class="btn bg-white shadow min-w-[50%] my-2 flex justify-between"
			type="button"
			on:click={() => handleDownload()}>Download image <Icon icon="tabler:file-download" /></button
		>
	{/if}

	<button
		class="btn bg-white shadow min-w-[50%] my-2 flex justify-between"
		on:click={() => handleClipboardCopy()}
		>Copy to clipboard <Icon icon="tabler:clipboard-copy" /></button
	>
</div>
