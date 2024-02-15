import type { DrawerSettings } from '@skeletonlabs/skeleton';

export type ShareData = {
	title: string;
	url: string;
	clipboardMessage?: string;
	text?: string;
	files?: File[];
};

export const shareId = 'share-drawer';

export function shareDrawerSettings(data: ShareData): DrawerSettings {
	return {
		id: shareId,
		position: 'bottom',
		bgDrawer: 'bg-[#F2F2F2] text-[#383838]',
		width: 'w-full lg:w-auto lg:max-w-[680px] mx-auto',
		height: 'h-auto',
		rounded: 'rounded-t-xl',
		meta: data
	};
}
