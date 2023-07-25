<script lang="ts">
	import { Canvas, OrbitControls, T, useThrelte } from '@threlte/core';
	import Box from '$lib/Components/box.svelte';
	import { writable } from 'svelte/store';
	import gameStore from '$lib/Stores/GameStore';
	import { MeshBasicMaterial, type Mesh } from 'three';
	//	import type {  Mesh } from 'three';
	import { getTexture } from '$lib/Textures';
	import Toolpicker from '$lib/Components/overlays/Toolpicker.svelte';
	import GameOver from '$lib/Components/overlays/GameOver.svelte';
	import { onMount } from 'svelte';
	let isMoving = writable(false);
	let currentTool: 'shovel' | 'flag' = 'shovel';

	const width = 3;
	const height = 3;
	const depth = 3;
	type block =
		| {
				x: number;
				y: number;
				z: number;
				type: 'block' | 'bomb';
				isFlagged: boolean;
				isSweeped: boolean;
				facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
		  }
		| {
				x: number;
				y: number;
				z: number;
				type: 'air';
		  };

	let cubeRefs: Mesh[][][] = [];
	let estimatedBombsRemaining = 0;
	let cube: block[][][] = [];

	function init() {
		estimatedBombsRemaining = 0;
		cubeRefs = [];
		cube = createCube();
		currentTool = 'shovel';
		$gameStore = {
			gameId: Math.random().toString(36).substring(7),
			isGameOver: false,
			isPlaying: true,
			startTime: Date.now(),
			isGameWon: false,
			endTime: undefined,
			clicks: 0
		};
	}

	function createCube() {
		const totalAmount =
			width * height * depth -
			Math.max(width - 2, 0) * Math.max(height - 2, 0) * Math.max(depth - 2, 0);
		const totalBombs = Math.max(Math.floor(totalAmount / 10), 1);
		let bombsRemaining = totalBombs;
		const cube: block[][][] = [];
		for (let x = 0; x < width; x++) {
			cube[x] = [];
			for (let y = 0; y < height; y++) {
				cube[x][y] = [];
				for (let z = 0; z < depth; z++) {
					//Set outline to true and center to false
					if (
						x === 0 ||
						x === width - 1 ||
						y === 0 ||
						y === height - 1 ||
						z === 0 ||
						z === depth - 1
					) {
						const facing = (() => {
							if (x === 0) return 'left';
							else if (x === width - 1) return 'right';
							else if (y === 0) return 'down';
							else if (y === height - 1) return 'up';
							else if (z === 0) return 'front';
							else return 'back';
						})();
						const isBomb = Math.random() < 0.1 && bombsRemaining > 0;
						if (isBomb) {
							bombsRemaining--;
							estimatedBombsRemaining++;
							cube[x][y][z] = {
								x,
								y,
								z,
								type: 'bomb',
								isFlagged: false,
								isSweeped: false,
								facing: facing
							};
						} else {
							cube[x][y][z] = {
								x,
								y,
								z,
								type: 'block',
								isFlagged: false,
								isSweeped: false,
								facing: facing
							};
						}
					} else {
						cube[x][y][z] = {
							x,
							y,
							z,
							type: 'air'
						};
					}
				}
			}
		}

		return cube;
	}

	async function handleClick(
		pos: { x: number; y: number; z: number },
		clickType: 'left' | 'right',
		ref: Mesh
	) {
		if ($isMoving) return;
		const block = cube[pos.x][pos.y][pos.z];
		if (block.type === 'air') return;

		if (clickType === 'left' && currentTool === 'shovel') {
			//Left click
			if (block.type === 'bomb') {
				console.log('You clicked a bomb!');
				updateTexture(pos.x, pos.y, pos.z, ref);
				gameOver();
				return;
			}
			if (block.isFlagged) return;
			if(block.isSweeped) return;
			$gameStore.clicks++;
			block.isSweeped = true;
			cascadeEmptyBlocks();
		} else {
			//Right click
			if (block.isFlagged) {
				block.isFlagged = false;
				estimatedBombsRemaining++;
			} else {
				block.isFlagged = true;
				estimatedBombsRemaining--;
			}
			$gameStore.clicks++;
		}
		cube[pos.x][pos.y][pos.z] = block;
		updateTexture(pos.x, pos.y, pos.z, ref);
	}

	function cascadeEmptyBlocks() {
		let hasChanged = false;
		let update: block[] = [];
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type === 'air') continue;
					if (block.type === 'bomb') continue;
					if (!block.isSweeped) continue;
					const bombsAround = getBombsAround(x, y, z);
					if (bombsAround !== 0) continue;
					for (let deltaX = -1; deltaX <= 1; deltaX++) {
						for (let deltaY = -1; deltaY <= 1; deltaY++) {
							for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
								if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;
								const finalX = x + deltaX;
								const finalY = y + deltaY;
								const finalZ = z + deltaZ;
								if (finalX < 0 || finalX >= width) continue;
								if (finalY < 0 || finalY >= height) continue;
								if (finalZ < 0 || finalZ >= depth) continue;
								const block = cube[finalX][finalY][finalZ];
								if (block.type === 'air') continue;
								if (block.type === 'bomb') continue;
								if (block.isSweeped) continue;
								update.push(block);
								block.isSweeped = true;
								updateTexture(finalX, finalY, finalZ, cubeRefs[finalX][finalY][finalZ]);
								hasChanged = true;
							}
						}
					}
				}
			}
		}
		if (hasChanged) cascadeEmptyBlocks();
	}

	function updateTexture(x: number, y: number, z: number, ref: Mesh) {
		const newTexure = getTextureForBlock(x, y, z);
		if (!newTexure) return;
		ref.material = new MeshBasicMaterial({ map: getTexture(newTexure) });
	}

	function getBombsAround(x: number, y: number, z: number) {
		let bombs = 0;
		for (let deltaX = -1; deltaX <= 1; deltaX++) {
			for (let deltaY = -1; deltaY <= 1; deltaY++) {
				for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
					if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;
					const finalX = x + deltaX;
					const finalY = y + deltaY;
					const finalZ = z + deltaZ;
					if (finalX < 0 || finalX >= width) continue;
					if (finalY < 0 || finalY >= height) continue;
					if (finalZ < 0 || finalZ >= depth) continue;

					const block = cube[finalX][finalY][finalZ];
					if (!block) continue;
					if (block.type === 'bomb') bombs++;
				}
			}
		}
		return bombs;
	}

	function getTextureForBlock(x: number, y: number, z: number) {
		const block = cube[x][y][z];

		if (block.type === 'air') return;
		if (block.isFlagged) return 'block_flag';
		if (block.isSweeped) {
			if (block.type === 'bomb') return 'block_bomb_exploded';
			const bombsAround = getBombsAround(x, y, z);

			if (bombsAround === 0 || bombsAround > 8) return 'block_open_air';
			return `block_open_${bombsAround}`;
		}

		return 'block_default';
	}

	function updateRef(position: { x: number; y: number; z: number }, ref: Mesh) {
		if (!cubeRefs[position.x]) cubeRefs[position.x] = [];
		if (!cubeRefs[position.x][position.y]) cubeRefs[position.x][position.y] = [];

		cubeRefs[position.x][position.y][position.z] = ref;
	}

	function countBombs() {
		let bombs = 0;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type === 'bomb') bombs++;
				}
			}
		}
		return bombs;
	}

	function gameOver() {
		$gameStore = {
			...$gameStore,
			isGameOver: true,
			isPlaying: false,
			isGameWon: false,
			endTime: Date.now(),
			bombs: countBombs()
		};
	}

	onMount(() => {
		init();
	});
</script>

<div class="canvasContainer w-screen h-screen">
	{#if $gameStore}
		{#key $gameStore.gameId}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[width + 10, height + 10, depth + 10]} fov={24}>
					<OrbitControls
						enablePan={false}
						enableZoom={$gameStore.isPlaying || true}
						enableRotate={$gameStore.isPlaying || true}
						
						autoRotate={!$gameStore.isPlaying}
						maxZoom={1}
						target={{ x: width / 2 - 0.5, y: height / 2 - 0.5, z: depth / 2 - 0.5 }}
						on:start={() => {
							isMoving.set(true);
						}}
						on:end={() => {
							isMoving.set(false);
						}}
					/>
				</T.PerspectiveCamera>
				<T.DirectionalLight castShadow position={[3, 10, 10]} />
				<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
				<T.AmbientLight intensity={0.2} />
				<T.Group>
					{#each cube as xAxes, x}
						{#each xAxes as yAxes, y}
							{#each yAxes as zAxes, z}
								{#if zAxes.type !== 'air'}
									{@const texture = getTextureForBlock(x, y, z)}
									<Box
										position={{ x, y, z }}
										clickCallback={handleClick}
										{texture}
										{updateRef}
										{isMoving}
									/>
								{/if}
							{/each}
						{/each}
					{/each}
				</T.Group>
			</Canvas>
		{/key}
	{/if}
</div>
<Toolpicker bind:value={currentTool} />
<p class="badge fixed left-5 bottom-5">{estimatedBombsRemaining}</p>
<!--<GameOver restart={() => init()} />
-->