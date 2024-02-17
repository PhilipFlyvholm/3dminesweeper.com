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

