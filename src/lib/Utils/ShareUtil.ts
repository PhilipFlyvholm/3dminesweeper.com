import { gameStore } from '$lib/Stores/GameStore';
import type { DrawerStore } from '@skeletonlabs/skeleton';

import { share as skeletonShare, type Share } from 'skeleton-share';
import { get } from 'svelte/store';

function dataURLtoFile(dataurl: string, filename: string) {
	const arr = dataurl.split(',');
	if (arr.length < 2) return null;
	const mime = arr[0].match(/:(.*?);/);
	if (!mime) return null;
	const bstr = atob(arr[arr.length - 1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime[1] });
}

export function share(prettyDate: string, drawerStore: DrawerStore, shareableImage: string) {
	const $gameStore = get(gameStore);
	if (!$gameStore || !$gameStore.isGameOver || !$gameStore.isGameWon) return;
	const time = prettyDate.split(':');
	const hours = parseInt(time[0]);
	const minutes = parseInt(time[1]);
	const seconds = parseInt(time[2]);
	const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds > 0 ? seconds + 's' : ''}`;

	const message = `I just played 3D Minesweeper and cleared a ${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth} in ${timeString}!`;
	const file = dataURLtoFile(shareableImage, '3D Minesweeper.png');

	const title = '3D Minesweeper';
	const url = 'https://3dminesweeper.com';
	const data: Share = {
		title,
		url,
		text: message,
		clipboardText: message + ` Try to beat me at ${url}`,
		files: file ? [file] : undefined
	};
	skeletonShare(data, drawerStore, {}, true).then((shareType) => {
		if (shareType === 'UI') {
			console.log('Sharing (directly) via UI');
		} else {
			console.log('Sharing nativly');
		}
	});
}
