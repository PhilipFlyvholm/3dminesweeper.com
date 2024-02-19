import { shareDrawerSettings } from '$lib/Components/overlays/drawers/share/ShareDrawerSettings';
import { gameStore } from '$lib/Stores/GameStore';
import { imageStore } from '$lib/Stores/ImageStore';
import { createToast } from '$lib/Utils/ToastUtil';
import type { DrawerStore, ToastStore } from '@skeletonlabs/skeleton';
import type { ShareData } from '$lib/Components/overlays/drawers/share/ShareDrawerSettings';
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

export function share(prettyDate: string, toastStore: ToastStore, drawerStore: DrawerStore, shareableImage: string) {
	const $gameStore = get(gameStore);
	if (!$gameStore || !$gameStore.isGameOver || !$gameStore.isGameWon) return;
	const time = prettyDate.split(':');
	const hours = parseInt(time[0]);
	const minutes = parseInt(time[1]);
	const seconds = parseInt(time[2]);
	const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${
		seconds > 0 ? seconds + 's' : ''
	}`;

	const message = `I just played 3D Minesweeper and cleared a ${$gameStore.size.width}x${$gameStore.size.height}x${$gameStore.size.depth} in ${timeString}!`;
    const file = dataURLtoFile(shareableImage, '3D Minesweeper.png');
	
    const title = '3D Minesweeper';
    const url = 'https://3dminesweeper.com';
	if (navigator.canShare !== undefined && navigator.share) {
		console.log('Sharing');
		const shareObject = createShareObject(title, url, message, file ? [file] : undefined);
		navigator
			.share(shareObject)
			.then(() => {
				createToast(toastStore, 'Successfully shared!');
				console.log('Share was successful.');
			})
			.catch(() => {
                console.log('Sharing via UI');
                drawerStore.open(shareDrawerSettings({
                    title,
                    url,
                    text: message,
                    clipboardMessage: message + ` Try to beat me at ${url}`,
                    files: file ? [file] : undefined
                }))
			});
	} else {
        console.log('Sharing (directly) via UI');
        
        
        drawerStore.open(shareDrawerSettings({
            title,
            url,
            text: message,
            clipboardMessage: message + ` Try to beat me at ${url}`,
            files: file ? [file] : undefined
        }))
        
	}
}

function createShareObject(title: string, url: string, text?: string, files?: File[]): ShareData {
	const baseShareObject = {
		title,
		url
	};
	if (!navigator.canShare) {
		return baseShareObject;
	}
	if (files && files.length > 0) {
		const fileShareObject = {
			...baseShareObject,
			text,
			files
		};
		if (navigator.canShare(fileShareObject)) {
			return fileShareObject;
		}
	}
	const textShareObject = {
		...baseShareObject,
		text
	};
	if (navigator.canShare(textShareObject)) {
		return textShareObject;
	}
	return baseShareObject;
}
