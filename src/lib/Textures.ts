import { useLoader } from '@threlte/core';
import * as THREE from 'three';
import { TextureLoader, type Texture } from 'three';
import { load } from '../routes/play/[size]/+page';

const texturePaths: {
	name: string;
	light_path: string;
	dark_path: string;
}[] = [
	{
		name: 'block_open_air',
		light_path: '/blocks/light/value=Default.png',
		dark_path: '/blocks/dark/value=Default.png'
	},
	{
		name: 'block_open_1',
		light_path: '/blocks/light/value=1.png',
		dark_path: '/blocks/dark/value=1.png'
	},
	{
		name: 'block_open_2',
		light_path: '/blocks/light/value=2.png',
		dark_path: '/blocks/dark/value=2.png'
	},
	{
		name: 'block_open_3',
		light_path: '/blocks/light/value=3.png',
		dark_path: '/blocks/dark/value=2.png'
	},
	{
		name: 'block_open_4',
		light_path: '/blocks/light/value=4.png',
		dark_path: '/blocks/dark/value=4.png'
	},
	{
		name: 'block_open_5',
		light_path: '/blocks/light/value=5.png',
		dark_path: '/blocks/dark/value=5.png'
	},
	{
		name: 'block_open_6',
		light_path: '/blocks/light/value=6.png',
		dark_path: '/blocks/dark/value=6.png'
	},
	{
		name: 'block_open_7',
		light_path: '/blocks/light/value=7.png',
		dark_path: '/blocks/dark/value=7.png'
	},
	{
		name: 'block_open_8',
		light_path: '/blocks/light/value=8.png',
		dark_path: '/blocks/dark/value=8.png'
	},
	{
		name: 'block_default',
		light_path: '/blocks/light/type=Default.png',
		dark_path: '/blocks/dark/type=Default.png'
	},
	{
		name: 'block_bomb',
		light_path: '/blocks/light/type=bomb.png',
		dark_path: '/blocks/dark/type=bomb.png'
	},
	{
		name: 'block_bomb_exploded',
		light_path: '/blocks/light/type=bomb_explosion.png',
		dark_path: '/blocks/dark/type=bomb_explosion.png'
	},
	{
		name: 'block_flag',
		light_path: '/blocks/light/type=flag.png',
		dark_path: '/blocks/dark/type=flag.png'
	},
	{
		name: 'block_flag_wrong',
		light_path: '/blocks/light/type=flag_wrong.png',
		dark_path: '/blocks/dark/type=flag_wrong.png'
	}
];
let loaded = false;
let loading = false;
let light_textures: Map<string, Texture> = new Map();
let dark_textures: Map<string, Texture> = new Map();
type Theme = 'light' | 'dark';
function loadTexture(
	textureLoader: any,
	name: string,
	path: string,
	theme: Theme
): Promise<Texture> {
	return new Promise((resolve, reject) => {
		textureLoader
			.load(path)
			.then((blockTexture: THREE.Texture) => {
				blockTexture.repeat.set(1, 1);
				blockTexture.wrapS = blockTexture.wrapT = THREE.RepeatWrapping;
				blockTexture.colorSpace = THREE.SRGBColorSpace;
				if (theme === 'light') light_textures.set(name, blockTexture);
				else dark_textures.set(name, blockTexture);
				resolve(blockTexture);
			})
			.catch((e: any) => {
				console.log('Failed to load', name, e);
				reject(e);
			});
	});
}

async function loadTextures(): Promise<void> {
	light_textures = new Map();
	dark_textures = new Map();
	const textureLoader = useLoader(TextureLoader);
	loading = true;
	const loaders = texturePaths.flatMap(({ name, light_path, dark_path }) => {
		return [
			loadTexture(textureLoader, name, light_path, 'light'),
			loadTexture(textureLoader, name, dark_path, 'dark')
		];
	});
	await Promise.all(loaders);
	loaded = true;
	return Promise.resolve();
}

export async function loadTexturesIfUnloaded() {
	if (!loading && !loaded) await loadTextures();
	return light_textures;
}
