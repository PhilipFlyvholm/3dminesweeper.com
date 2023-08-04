<script lang="ts">
	import gameStore from '$lib/Stores/GameStore';
	import { OrbitControls } from '@threlte/extras';
	import InteractiveScene from '$lib/Components/InteractiveScene.svelte';
	import { T, useThrelte } from '@threlte/core';
	import { writable } from 'svelte/store';
	import { Mesh, MeshBasicMaterial } from 'three';
	import { getTexture } from '$lib/Textures';
	import type { Block } from '$lib/Types/GameTypes';
	import { getBombsAround } from '$lib/Utils/GenerationUtil';
	import Cube from './Cube.svelte';

	export let updateTime: () => void = () => {};
	export let currentTool: 'shovel' | 'flag';
	let cubeRefs: Mesh[][][] = [];
	export let estimatedBombsRemaining: number;
	export let cube: Block[][][];
    $: width = cube.length;
    $: height = cube[0].length;
    $: depth = cube[0][0].length;
	const {invalidate} = useThrelte();
	
	function isComplete() {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type === 'bomb' && block.isSweeped) return false;
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
				bombs: 0
			};
			showSweeped(true);
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
	function showSweeped(win: boolean) {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube[x][y][z];
					if (block.type == 'air' || block.isSweeped) continue;
					if (block.isFlagged) {
						if (block.type === 'bomb') continue;
						block.isFlagged = false;
					} else if (block.type === 'bomb') {
						if (win) {
							block.isFlagged = true;
						} else {
							block.isSweeped = true;
						}
					} else {
						block.isSweeped = true;
					}
					updateTextureAsync(x, y, z, cubeRefs[x][y][z]);
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
		showSweeped(false);
	}

	async function handleClick(
		pos: { x: number; y: number; z: number },
		clickType: 'left' | 'right',
		ref: Mesh
	) {
		if ($isMoving !== 'none') return;
		const block = cube[pos.x][pos.y][pos.z];
		if (block.type === 'air') return;
		if (!$gameStore.isPlaying || $gameStore.isGameOver) return;
		if ($gameStore.startTime === null) {
			$gameStore.startTime = Date.now();
			updateTime();
		}
		if (clickType === 'left' && currentTool === 'shovel') {
			//Left click
			if (block.type === 'bomb') {
				console.log('You clicked a bomb!');
				updateTextureAsync(pos.x, pos.y, pos.z, ref);
				gameOver();
				return;
			}
			if (block.isFlagged) return;
			if (block.isSweeped) return;
			$gameStore.clicks++;
			block.isSweeped = true;
			cascadeEmptyBlocks(pos.x, pos.y, pos.z);
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
		updateTextureAsync(pos.x, pos.y, pos.z, ref);

		checkWin();
	}

	function cascadeEmptyBlocks(x: number, y: number, z: number) {
		let update: Block[] = [];

		const bombsAround = getBombsAround(x, y, z, cube);
		if (bombsAround !== 0) return;
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
					if (block.type === 'air') continue;
					if (block.type === 'bomb') continue;
					if (block.isSweeped) continue;

					update.push(block);
					block.isSweeped = true;
					updateTextureAsync(finalX, finalY, finalZ, cubeRefs[finalX][finalY][finalZ]);
				}
			}
		}
		update.forEach((block) => {
			cascadeEmptyBlocks(block.x, block.y, block.z);
		});
	}

	function updateRef(position: { x: number; y: number; z: number }, ref: Mesh) {
		if (!cubeRefs[position.x]) cubeRefs[position.x] = [];
		if (!cubeRefs[position.x][position.y]) cubeRefs[position.x][position.y] = [];

		cubeRefs[position.x][position.y][position.z] = ref;
	}
	function getTextureForBlock(x: number, y: number, z: number) {
		const block = cube[x][y][z];

		if (block.type === 'air') return;
		if (block.isFlagged) return 'block_flag';
		if (block.isSweeped) {
			if (block.type === 'bomb') return 'block_bomb_exploded';
			const bombsAround = getBombsAround(x, y, z, cube);

			if (bombsAround === 0 || bombsAround > 8) return 'block_open_air';
			return `block_open_${bombsAround}`;
		}

		return 'block_default';
	}
	async function updateTextureAsync(x: number, y: number, z: number, ref: Mesh) {
		const newTexure = getTextureForBlock(x, y, z);
		if (!newTexure) return;
		const texture = await getTexture(newTexure);
		ref.material = new MeshBasicMaterial({ map: texture });
		invalidate()
	}

	let isMoving = writable<'click' | 'drag' | 'none'>('none');
	let isPlaying = false;
	$: isPlaying = $gameStore ? $gameStore.isPlaying : false;
	
	const dragDelay = 500; //The amount of time to wait before starting to drag
	const dragEndDelay = 100; //The amount of time to wait before stopping dragging
	let stopDraggingTimeout: NodeJS.Timeout | undefined;
	function handlePanStart() {
		isMoving.set('click');

		setTimeout(async () => {
			if ($isMoving === 'click') {
				isMoving.set('drag');
			}
		}, dragDelay);
	}

	function handlePanEnd() {
		if ($isMoving === 'click') {
			isMoving.set('none');
		} else {
			stopDraggingTimeout = setTimeout(async () => {
				if ($isMoving !== 'none') isMoving.set('none');
			}, dragEndDelay);
		}
	}
</script>


	<InteractiveScene>
		<T.Cache enabled={true} />
		<T.PerspectiveCamera makeDefault position={[width * 3, height * 3, depth * 3]} fov={24}>
			<OrbitControls
				enablePan={false}
				enableZoom={true}
				enableRotate={true}
				autoRotate={!isPlaying}
				minDistance={Math.max(width, height, depth) * 2 + 5}
				maxDistance={Math.max(width, height, depth) * 2 + 100}
				target={[width / 2 - 0.5, height / 2 - 0.5, depth / 2 - 0.5]}
				on:start={handlePanStart}
				on:end={handlePanEnd}
			/>
		</T.PerspectiveCamera>
		<T.DirectionalLight castShadow position={[3, 10, 10]} />
		<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
		<T.AmbientLight intensity={0.2} />
		<T.Fog color={[214, 15, 15]} near={0.25} far={4} />
		<Cube {cube} {getTextureForBlock} {updateRef} {handleClick} {isMoving}/>
	</InteractiveScene>