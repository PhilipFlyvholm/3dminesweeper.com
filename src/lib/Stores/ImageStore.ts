import { writable } from 'svelte/store';

type ImageStore = {
	showcaseMode: boolean;
	gameOverImage: string;
	showcaseImages: string[];
	processesingGameOverImage: boolean;
};
export const imageStore = writable<ImageStore>({
	showcaseMode: false,
	gameOverImage: '',
	showcaseImages: [],
	processesingGameOverImage: false
});
