import { writable } from 'svelte/store';

type ShapeInspector = {
	splitAt: number;
	enableSplit: boolean;
	interactivityDebug: boolean;
};

export const shapeInspectorStore = writable<ShapeInspector>({
	splitAt: 0,
	enableSplit: false,
	interactivityDebug: false
});
export const devMode = writable<boolean>(false);
