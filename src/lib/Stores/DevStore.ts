import { writable } from "svelte/store";

type ShapeInspector = {
    splitAt: number;
    enableSplit: boolean
}

export const shapeInspectorStore = writable<ShapeInspector>({ splitAt: 0, enableSplit: false });
