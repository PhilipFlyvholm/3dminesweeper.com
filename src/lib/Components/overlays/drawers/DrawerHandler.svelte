<script lang="ts">
	import { createToast as createToastBase } from '$lib/Utils/ToastUtil';
	import { Drawer, getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import { ShareDrawer, isShareDrawer } from 'skeleton-share';
	import { EmailProvider, FacebookProvider, LinkedInProvider, MessengerProvider, WhatsAppProvider, XProvider, type ShareProvider } from 'skeleton-share/providers';
	import { PUBLIC_FACEBOOK_APP_ID } from '$env/static/public';
	const drawerStore = getDrawerStore();
	const toastStore = getToastStore();
	let drawer: Drawer;

	const shareProviders: ShareProvider[] = [
		EmailProvider,
		FacebookProvider,
		MessengerProvider(PUBLIC_FACEBOOK_APP_ID),
		XProvider,
		WhatsAppProvider,
		LinkedInProvider
	];
	//const shareProviders:any[] = []
	const createToast = (msg: string, error = false) => createToastBase(toastStore, msg, error);
</script>

<Drawer bind:this={drawer}>
	{#if isShareDrawer(drawerStore)}
		<ShareDrawer
			{drawer}
			{shareProviders}
			on:clipboard-success={() => createToast('Copied to clipboard!')}
			on:clipboard-error={() => createToast('Failed to copy to clipboard', true)}
			on:download-success={() => createToast('Downloaded!')}
			on:social-share={(e) => createToast(`Shared via ${e.detail.provider}!`)}
			
		/>
	{:else}
		<!-- Fallback Error -->
		<div class="flex h-full w-full items-center justify-center">
			<div class="space-y-2 text-center">
				<p>Hmm... It does not seem like I should have showed you this?</p>
				<button class="btn-primary btn" on:click={() => drawerStore.close()}>Close</button>
			</div>
		</div>
	{/if}
</Drawer>
