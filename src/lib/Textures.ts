import { useLoader } from '@threlte/core';
import * as THREE from 'three';
import { TextureLoader, type Texture } from 'three';

const texturePaths: {
	name: string;
	path: string;
}[] = [
	{
		name: 'block_open_air',
		path: '/blocks/value=Default.png'
	},
	{
		name: 'block_open_1',
		path: '/blocks/value=1.png'
	},
	{
		name: 'block_open_2',
		path: '/blocks/value=2.png'
	},
	{
		name: 'block_open_3',
		path: '/blocks/value=3.png'
	},
	{
		name: 'block_open_4',
		path: '/blocks/value=4.png'
	},
	{
		name: 'block_open_5',
		path: '/blocks/value=5.png'
	},
	{
		name: 'block_open_6',
		path: '/blocks/value=6.png'
	},
	{
		name: 'block_open_7',
		path: '/blocks/value=7.png'
	},
	{
		name: 'block_open_8',
		path: '/blocks/value=8.png'
	},
	{
		name: 'block_default',
		path: '/blocks/type=Default.png'
	},
	{
		name: 'block_bomb',
		path: '/blocks/type=bomb.png'
	},
	{
		name: 'block_bomb_exploded',
		path: '/blocks/type=bomb_explosion.png'
	},
	{
		name: 'block_flag',
		path: '/blocks/type=flag.png'
	},
	{
		name: 'block_flag_wrong',
		path: '/blocks/type=flag_wrong.png'
	}
];

let loaded = false;
let loading = false;
const textures: Map<string, Texture> = new Map();

async function loadTextures(): Promise<void> {
	const textureLoader = useLoader(TextureLoader);
	loading = true;
	const loaders = texturePaths.map(({ name, path }) => {
		return new Promise((resolve, reject) => {
			textureLoader
				.load(path)
				.then((blockTexture) => {
					blockTexture.repeat.set(1, 1);
					blockTexture.wrapS = blockTexture.wrapT = THREE.RepeatWrapping;
					blockTexture.colorSpace = THREE.SRGBColorSpace;
					textures.set(name, blockTexture);
					resolve(blockTexture);
				})
				.catch((e) => {
					console.log('Failed to load', name, e);
					reject(e);
				});
		});
	});
	await Promise.all(loaders);
	loaded = true;
	return Promise.resolve();
}

export async function getTexture(name: string): Promise<Texture | undefined> {
	if (!loaded) {
		if (loading) {
			console.log('Waiting for textures to load');
			while (!loaded) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		} else {
			console.log('Loading textures');
			await loadTextures();
		}
	}
	const texture = textures.get(name);
	if (texture === undefined) {
		console.warn(`Texture ${name} not found`);
		return undefined;
	}
	return texture;
}
