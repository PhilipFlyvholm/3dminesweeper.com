import { useTexture } from "@threlte/core";
import type { Texture } from "three";
import * as THREE from "three";

const texturePaths: {
	name: string;
	path: string;
}[] = [
	{
		name: 'block_open_air',
		path: 'blocks/value=Default.png'
	},
	{
		name: 'block_open_1',
		path: 'blocks/value=1.png'
	},
	{
		name: 'block_open_2',
		path: 'blocks/value=2.png'
	},
	{
		name: 'block_open_3',
		path: 'blocks/value=3.png'
	},
	{
		name: 'block_open_4',
		path: 'blocks/value=4.png'
	},
	{
		name: 'block_open_5',
		path: 'blocks/value=5.png'
	},
	{
		name: 'block_open_6',
		path: 'blocks/value=6.png'
	},
	{
		name: 'block_open_7',
		path: 'blocks/value=7.png'
	},
	{
		name: 'block_open_8',
		path: 'blocks/value=8.png'
	},
	{
		name: 'block_default',
		path: 'blocks/type=Default.png'
	},
	{
		name: 'block_bomb',
		path: 'blocks/type=bomb.png'
	},
	{
		name: 'block_bomb_exploded',
		path: 'blocks/type=bomb_explosion.png'
	},
	{
		name: 'block_flag',
		path: 'blocks/type=flag.png'
	},
	{
		name: 'block_flag_wrong',
		path: 'blocks/type=flag_wrong.png'
	}
];

let loaded = false;
export const textures: Map<string, Texture> = new Map();

function loadTextures(): void {
	texturePaths.forEach(({ name, path }) => {
		const blockTexture = useTexture(path, {
			onError: (e) => console.log("Failed to load",name, e)
		});
		blockTexture.repeat.set(1, 1);
		blockTexture.wrapS = blockTexture.wrapT = THREE.RepeatWrapping;
		blockTexture.colorSpace = THREE.SRGBColorSpace;
		textures.set(name, blockTexture);
	});
	loaded = true;
}

export function getTexture(name: string): Texture | undefined {
    if (!loaded) {
        loadTextures();
    }
    return textures.get(name);
}