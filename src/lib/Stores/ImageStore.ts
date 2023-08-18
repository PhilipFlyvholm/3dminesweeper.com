import { writable } from 'svelte/store';

type ImageStore = {
	showcaseMode: boolean;
	gameOverImage: string;
	showcaseImages: string[];
};
export const imageStore = writable<ImageStore>({
	showcaseMode: false,
	gameOverImage: '',
	showcaseImages: []
});

export const takeImage = (final: boolean) => {
	const canvas = document.getElementsByTagName('canvas')[0];
	const dataUrl = canvas.toDataURL('image/png', 1.0);
    if(dataUrl === 'data:,') return; //Something is wrong with the canvas
	imageStore.update((store) => {
        if(final) store.gameOverImage = dataUrl;
		else store.showcaseImages.push(dataUrl);
		return store;
	});
};
