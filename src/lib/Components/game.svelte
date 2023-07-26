<script lang="ts">
	import Box from '$lib/Components/box.svelte';
	import GameOver from '$lib/Components/overlays/GameOver.svelte';
	import Toolpicker from '$lib/Components/overlays/Toolpicker.svelte';
	import gameStore from '$lib/Stores/GameStore';
	import { getTexture } from '$lib/Textures';
	import { Canvas, OrbitControls, T } from '@threlte/core';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { DefaultLoadingManager, MeshBasicMaterial, type Mesh } from 'three';
	import DataOverlay from './overlays/DataOverlay.svelte';
	import type { Block } from '$lib/Types/GameTypes';

	export let width = 5;
	export let height = 5;
	export let depth = 5;

	let isMoving = writable(false);
	let currentTool: 'shovel' | 'flag' = 'shovel';
    let cubeRefs: Mesh[][][] = [];
    let estimatedBombsRemaining = 0;
    let cube: Block[][][] = [];


	function init() {
		estimatedBombsRemaining = 0;
		cubeRefs = [];
		cube = createCube();
		currentTool = 'shovel';
		$gameStore = {
			gameId: Math.random().toString(36).substring(7),
			isGameOver: false,
			isPlaying: true,
			startTime: null,
			isGameWon: false,
			clicks: 0
		};
	}

	function createCube() {
		const totalAmount =
			width * height * depth -
			Math.max(width - 2, 0) * Math.max(height - 2, 0) * Math.max(depth - 2, 0);

		const totalBombs = Math.max(Math.floor(totalAmount / 10), 1);
		const bombLocs: { x: number; y: number; z: number }[] = [];
		function isOutline(x: number, y: number, z: number) {
			return (
				x === 0 || x === width - 1 || y === 0 || y === height - 1 || z === 0 || z === depth - 1
			);
		}

		for (let i = 0; i < totalBombs; i++) {
			let x = Math.floor(Math.random() * width);
			let y = Math.floor(Math.random() * height);
			let z = Math.floor(Math.random() * depth);
			while (
				bombLocs.find((loc) => loc.x === x && loc.y === y && loc.z === z) ||
				!isOutline(x, y, z)
			) {
				x = Math.floor(Math.random() * width);
				y = Math.floor(Math.random() * height);
				z = Math.floor(Math.random() * depth);
			}
			bombLocs.push({ x, y, z });
		}

		const cube: Block[][][] = [];
		for (let x = 0; x < width; x++) {
			cube[x] = [];
			for (let y = 0; y < height; y++) {
				cube[x][y] = [];
				for (let z = 0; z < depth; z++) {
					//Set outline to true and center to false
					if (isOutline(x, y, z)) {
						const facing = (() => {
							if (x === 0) return 'left';
							else if (x === width - 1) return 'right';
							else if (y === 0) return 'down';
							else if (y === height - 1) return 'up';
							else if (z === 0) return 'front';
							else return 'back';
						})();
						const isBomb = bombLocs.find((loc) => loc.x === x && loc.y === y && loc.z === z);
						if (isBomb) {
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
        if(!$gameStore.isPlaying || $gameStore.isGameOver) return;
        if($gameStore.startTime === null){ 
            $gameStore.startTime = Date.now();
            updateTime();
        }
		if (clickType === 'left' && currentTool === 'shovel') {
			//Left click
			if (block.type === 'bomb') {
				console.log('You clicked a bomb!');
				updateTexture(pos.x, pos.y, pos.z, ref);
				gameOver();
				return;
			}
			if (block.isFlagged) return;
			if (block.isSweeped) return;
			$gameStore.clicks++;
			block.isSweeped = true;
			cascadeEmptyBlocks();
			checkWin();
		} else {
			//Right click
			if (block.isSweeped) return;
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

		checkWin();
	}

	function cascadeEmptyBlocks() {
		let hasChanged = false;
		let update: Block[] = [];
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

	function isComplete() {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type === 'bomb' && !block.isFlagged) return false;
					if (block.type === 'block' && !block.isSweeped) return false;
				}
			}
		}
		return true;
	}
	function checkWin() {
		if (isComplete()) {
			$gameStore = {
				...$gameStore,
				isGameOver: true,
				isPlaying: false,
				isGameWon: true,
				endTime: Date.now(),
				bombs: countBombs(true)
			};
		}
	}

	function countBombs(ignoreFlagged = false) {
		let bombs = 0;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type === 'bomb' && (!ignoreFlagged || !block.isFlagged)) bombs++;
				}
			}
		}
		return bombs;
	}

	function showSweeped() {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type == 'air' || block.isSweeped) continue;
					if (block.isFlagged) {
						if (block.type === 'bomb') continue;
						block.isFlagged = false;
					}
					block.isSweeped = true;
					updateTexture(x, y, z, cubeRefs[x][y][z]);
				}
			}
		}
	}

	function gameOver() {
		$gameStore = {
			...$gameStore,
			isGameOver: true,
			isPlaying: false,
			isGameWon: false,
			endTime: Date.now(),
			bombs: countBombs(true)
		};
		showSweeped();
	}

	onMount(() => {
		init();
	});

	const progress = writable(0);
	const tweenedProgress = tweened($progress, {
		duration: 200
	});
	$: tweenedProgress.set($progress);

	DefaultLoadingManager.onStart = function () {
		//Do something on loading start
		console.log('Loading started');
	};

	DefaultLoadingManager.onLoad = function () {
		console.log('Loading Complete!');
	};

	DefaultLoadingManager.onProgress = function (_, itemsLoaded, itemsTotal) {
		$progress = itemsLoaded / itemsTotal;
	};

	DefaultLoadingManager.onError = function (url) {
		console.log('There was an error loading ' + url);
	};

	if (import.meta.hot) {
		setTimeout(() => {
			if ($progress === 0) {
				$progress = 1;
			}
		}, 1000);
	}

	let isPlaying = false;
	$: isPlaying = $gameStore ? $gameStore.isPlaying : false;

	let timePlayed = 0;
	let timeout: string | number | NodeJS.Timeout | undefined;
	async function updateTime() {
		if (timeout) clearTimeout(timeout);
        if($gameStore.startTime === null) return;
		if ($gameStore.isPlaying) timeout = setTimeout(updateTime, 1000);
		timePlayed = Date.now() - $gameStore.startTime;
	}
</script>

<div class="canvasContainer w-screen h-screen">
	{#if $gameStore}
		{#key $gameStore.gameId}
			{#if $tweenedProgress < 1}
				<div
					transition:fade|local={{
						duration: 1000
					}}
					class="loadingWrapper absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-gray-900"
				>
					<p class="loading">Loading</p>
					<div class="bar-wrapper relative h-[10px] w-[33.33%] border-secondary-500">
						<div class="bar bg-primary-500 h-full" style="width: {$tweenedProgress * 100}%" />
					</div>
				</div>
			{/if}
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[width * 3, height * 3, depth * 3]} fov={24}>
					<OrbitControls
						enablePan={false}
						enableZoom={true}
						enableRotate={true}
						autoRotate={!isPlaying}
						minDistance={Math.max(width, height, depth) * 2 + 5}
						maxDistance={Math.max(width, height, depth) * 2 + 100}
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
							{#each yAxes as box, z}
								{#if box.type !== 'air'}
									{@const texture = getTextureForBlock(x, y, z)}
									<Box
										position={{ x, y, z }}
										clickCallback={handleClick}
										{texture}
										{updateRef}
										{isMoving}
										isFlagged={box.isFlagged}
										facing={box.facing}
									/>
								{/if}
							{/each}
						{/each}
					{/each}
				</T.Group>-
			</Canvas>
		{/key}
	{/if}
</div>
<Toolpicker bind:value={currentTool} />
<DataOverlay position="left-5 bottom-5">
	<svg slot="icon" height="1em" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
		<!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
		<path
			d="M34.0738 3.88906L32.8492 0.482422C32.7082 0.192969 32.3965 0 32.0699 0C31.7434 0 31.4391 0.192969 31.298 0.482422L30.0734 3.88906L26.6594 5.13594C26.3402 5.25469 26.1176 5.57383 26.125 5.90781C26.125 6.2418 26.3477 6.55352 26.6594 6.66484L30.0512 7.91172L31.298 11.3109C31.4094 11.6375 31.7285 11.8676 32.0699 11.8676C32.4113 11.8676 32.7305 11.6375 32.8418 11.3109L34.0664 7.91172L37.4582 6.66484C37.7699 6.55352 37.9926 6.2418 37.9926 5.90781C37.9926 5.56641 37.7699 5.24727 37.4582 5.13594L34.0738 3.88906ZM24.2473 7.82266C23.3195 6.89492 21.8129 6.89492 20.8852 7.82266L20.6699 8.03789C19.0371 7.44414 17.2707 7.125 15.4375 7.125C6.90977 7.125 0 14.0348 0 22.5625C0 31.0902 6.90977 38 15.4375 38C23.9652 38 30.875 31.0902 30.875 22.5625C30.875 20.7293 30.5559 18.9629 29.9695 17.3301L30.1848 17.1148C31.1125 16.1871 31.1125 14.6805 30.1848 13.7527L24.2473 7.81523V7.82266ZM14.8438 14.25C10.5836 14.25 7.125 17.7086 7.125 21.9688V22.5625C7.125 23.2156 6.59062 23.75 5.9375 23.75C5.28438 23.75 4.75 23.2156 4.75 22.5625V21.9688C4.75 16.3949 9.26992 11.875 14.8438 11.875H15.4375C16.0906 11.875 16.625 12.4094 16.625 13.0625C16.625 13.7156 16.0906 14.25 15.4375 14.25H14.8438Z"
			fill="black"
		/>
	</svg>
	{estimatedBombsRemaining}
</DataOverlay>
<DataOverlay position={'right-5 top-5'}>
	<svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"
		><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
			d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
		/></svg
	>
	{new Date(timePlayed).toISOString().substring(11, 19)}
</DataOverlay>
<GameOver restart={() => init()} />
