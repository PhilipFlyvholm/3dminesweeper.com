<script lang="ts">
	import InteractiveScene from '$lib/Components/InteractiveScene.svelte';
	import type { Block, Cube as CubeType } from '$lib/Cube';
	import { submitScore } from '$lib/Leaderboard';
	import { gameStore, mouse } from '$lib/Stores/GameStore';
	import { imageStore } from '$lib/Stores/ImageStore';
	import { getBombsAround } from '$lib/Utils/GenerationUtil';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls, Stars } from '@threlte/extras';
	import type { Writable } from 'svelte/store';
	import Cube from './Shape/Shape.svelte';
	import { ScreenShake } from '$lib/Utils/Effects/ScreenShake';
	import { Vector3 } from 'three';
	import { getFaceFromPoint } from '$lib/Utils/FaceUtil';
	import { takeImageOfCube } from '$lib/Utils/ImageUtil';

	export let updateTime: () => void = () => {};
	export let currentTool: 'shovel' | 'flag';
	export let estimatedBombsRemaining: number;
	export let cube: CubeType;
	const { renderStage, camera, renderer, scene } = useThrelte();

	$: width = cube.getWidth();
	$: height = cube.getHeight();
	$: depth = cube.getDepth();
	function isComplete() {
		for (let entry of cube.cube) {
			const b = entry[1];
			if (b.type === 'bomb' && b.isSweeped) return false;
			if (b.type === 'block' && !b.isSweeped) return false;
		}
		return true;
	}

	function checkWin() {
		const startTime = $gameStore.startTime;
		if (!$gameStore.isPlaying || startTime === null) return;
		if (isComplete()) {
			const endTime = Date.now();
			const efficiency = Math.floor(($gameStore.threeBV / $gameStore.clicks) * 10000) / 100;
			const threeBVPerSecond =
				Math.floor(($gameStore.threeBV / ((endTime - startTime) / 1000)) * 100) / 100;
			const updatedScore = submitScore(
				$gameStore.size,
				$gameStore.clicks,
				$gameStore.threeBV,
				threeBVPerSecond,
				efficiency,
				endTime - startTime
			);
			console.log('Updated score', updatedScore);

			$gameStore = {
				...$gameStore,
				isGameOver: true,
				isPlaying: false,
				isGameWon: true,
				endTime: endTime,
				bombs: 0,
				score: {
					updated: updatedScore,
					current: {
						clicks: $gameStore.clicks,
						threeBV: $gameStore.threeBV,
						efficiency: efficiency,
						time: endTime - startTime,
						threeBVPerSecond: threeBVPerSecond
					}
				}
			};
			showSweeped(true);
		}
	}

	function countBombs(ignoreFlagged = false) {
		let bombs = 0;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let z = 0; z < depth; z++) {
					const block = cube.getBlock(x, y, z);
					if (!block) continue;
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
					const block = cube.getBlock(x, y, z);
					if (!block) continue;
					if (block.isSweeped) continue;
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
					updateTexture(block);
				}
			}
		}
		invalidateCube();
	}

	function gameOver() {
		const startTime = $gameStore.startTime;
		if (!$gameStore.isPlaying || startTime === null) return;
		const endTime = Date.now();
		const efficiency = Math.floor(($gameStore.threeBV / $gameStore.clicks) * 10000) / 100;
		const threeBVPerSecond =
			Math.floor(($gameStore.threeBV / ((endTime - startTime) / 1000)) * 100) / 100;
		const updatedScore = {}; // No need to update score if game is lost
		$gameStore = {
			...$gameStore,
			isGameOver: true,
			isPlaying: false,
			isGameWon: false,
			endTime: endTime,
			bombs: countBombs(true),
			score: {
				updated: updatedScore,
				current: {
					clicks: $gameStore.clicks,
					threeBV: $gameStore.threeBV,
					efficiency: efficiency,
					time: endTime - startTime,
					threeBVPerSecond: threeBVPerSecond
				}
			}
		};
		showSweeped(false);
	}

	async function handleChording(pos: { x: number; y: number; z: number }, block: Block) {
		/*Chording can only happen if:
		 *	- Current block is sweeped
		 *	- The amount of flags adjactent is EQUAL to the amount of bombs adjactent
		 */

		if (block.type !== 'block') return;
		if (!block.isSweeped) return;
		const toUpdate: Block[] = [];
		let flags = 0;
		let bombs = 0;

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					const finalX = pos.x + x;
					const finalY = pos.y + y;
					const finalZ = pos.z + z;
					const localBlock = cube.getBlock(finalX, finalY, finalZ);
					if (!localBlock) continue;
					if (localBlock.type === 'bomb') {
						bombs++;
					}
					if (localBlock.isFlagged) {
						flags++;
					} else {
						toUpdate.push(localBlock);
					}
				}
			}
		}
		if (flags !== bombs) return;

		$gameStore.clicks++;
		for (const block of toUpdate) {
			block.isSweeped = true;
			cube.setBlock(block.x, block.y, block.z, block);
			updateTexture(block);
			if (block.type === 'bomb' && !block.isFlagged) {
				gameOver();
			}
			cascadeEmptyBlocks(block.x, block.y, block.z);
		}
		invalidateCube();
		checkWin();
	}

	function isValidMouseMove(clientX: number, clientY: number) {
		if ($mouse) {
			const xDiff = clientX - $mouse.x;
			const yDiff = clientY - $mouse.y;
			const totalDiff = Math.abs(xDiff) + Math.abs(yDiff);
			if (totalDiff > 10) return false;
		}
		return true;
	}

	async function handleLeftClick(
		pos: { x: number; y: number; z: number },
		clientX: number,
		clientY: number,
		point: Vector3
	) {
		console.log('Left click', pos);

		if (!isValidMouseMove(clientX, clientY)) return;
		if (!$gameStore.isPlaying || $gameStore.isGameOver) return;

		const block = cube.getBlock(pos.x, pos.y, pos.z);
		console.log('Block', block);

		if (!block) return;

		if ($gameStore.startTime === null) {
			//First click
			cube = await cube.populate(pos);

			$gameStore.startTime = Date.now();
			updateTime();
		}

		if (currentTool === 'flag') {
			return handleRightClick(pos, clientX, clientY, point);
		}

		//Left click
		if (block.isFlagged) return;
		if (block.type === 'bomb') {
			block.isSweeped = true;
			updateTexture(block);
			gameOver();
			return;
		}
		if (block.isSweeped) {
			return handleChording(pos, block);
		}

		$gameStore.clicks++;
		block.isSweeped = true;
		cascadeEmptyBlocks(pos.x, pos.y, pos.z);
		checkWin();
		cube.setBlock(pos.x, pos.y, pos.z, block);

		updateTexture(block);
		invalidateCube();
		checkWin();
	}

	function handleRightClick(
		pos: { x: number; y: number; z: number },
		clientX: number,
		clientY: number,
		point: Vector3
	) {
		if (!isValidMouseMove(clientX, clientY)) return;
		const block = cube.getBlock(pos.x, pos.y, pos.z);
		if (!block) return;
		if (block.isSweeped) return;
		if (block.isFlagged) {
			block.isFlagged = false;
			estimatedBombsRemaining++;
		} else {
			const face = getFaceFromPoint(point, pos);
			if (face) block.facing = face;
			block.isFlagged = true;
			estimatedBombsRemaining--;
		}
		$gameStore.clicks++;
		cube.setBlock(pos.x, pos.y, pos.z, block);

		updateTexture(block);
		invalidateCube();
	}

	let preReveal: { x: number; y: number; z: number }[] = [];

	function clearPreReveal() {
		while (preReveal.length !== 0) {
			const pos = preReveal.pop();
			if (!pos) continue;
			const block = cube.getBlock(pos.x, pos.y, pos.z);
			if (block) {
				updateTexture(block);
				cube = cube.setBlock(pos.x, pos.y, pos.z, block);
			}
		}
		invalidateCube();
	}

	async function handlePointerDown(pos: { x: number; y: number; z: number }) {
		const tmpPreReveal: { x: number; y: number; z: number }[] = [];
		const block = cube.getBlock(pos.x, pos.y, pos.z);

		if (!block) return;

		if (block.type === 'block') {
			if (block.isFlagged) return;
			if (block.isSweeped && currentTool === 'shovel') {
				//add all adjactent blocks to prereveal
				for (let x = -1; x <= 1; x++) {
					for (let y = -1; y <= 1; y++) {
						for (let z = -1; z <= 1; z++) {
							if (x === 0 && y === 0 && z === 0) continue;
							const finalX = pos.x + x;
							const finalY = pos.y + y;
							const finalZ = pos.z + z;

							tmpPreReveal.push({ x: finalX, y: finalY, z: finalZ });
						}
					}
				}
			} else {
				tmpPreReveal.push(pos);
			}
		} else if (block.type === 'bomb') {
			tmpPreReveal.push(pos);
		}
		for (const pos of tmpPreReveal) {
			const block = cube.getBlock(pos.x, pos.y, pos.z);
			if (!block) continue;
			if (block.isSweeped) continue;
			if (block.isFlagged) continue;
			preReveal.push(pos);
			updateTexture(block);
		}

		invalidateCube();
	}

	function cascadeEmptyBlocks(x: number, y: number, z: number) {
		let update: Block[] = [];

		const bombsAround = getBombsAround(x, y, z, cube.cube);
		if (bombsAround !== 0) return;
		for (let deltaX = -1; deltaX <= 1; deltaX++) {
			for (let deltaY = -1; deltaY <= 1; deltaY++) {
				for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
					if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;
					const finalX = x + deltaX;
					const finalY = y + deltaY;
					const finalZ = z + deltaZ;
					const block = cube.getBlock(finalX, finalY, finalZ);
					if (!block) continue;
					if (block.type === 'bomb') continue;
					if (block.isSweeped) continue;
					if (block.isFlagged) continue;

					update.push(block);
					block.isSweeped = true;
					updateTexture(block);
				}
			}
		}
		update.forEach((block) => {
			cascadeEmptyBlocks(block.x, block.y, block.z);
		});
		invalidateCube();
	}

	function getTextureForBlock(block: Block) {
		if (!block) return;
		if (block.isFlagged) return 'block_flag';
		const { x, y, z } = block;
		if (block.isSweeped) {
			if (block.type === 'bomb') return 'block_bomb_exploded';
			const bombsAround = getBombsAround(x, y, z, cube.cube);

			if (bombsAround === 0 || bombsAround > 8) {
				return 'block_open_air';
			}
			return `block_open_${bombsAround}`;
		}

		if (preReveal.find((e) => e.x === x && e.y === y && e.z === z)) {
			return currentTool === 'shovel' ? 'block_open_air' : 'block_flag';
		}

		return 'block_default';
	}

	function updateTexture(block: Block) {
		const newTexture = getTextureForBlock(block);
		if (!newTexture) return;
		block.texture = newTexture;
		cube.setBlock(block.x, block.y, block.z, block);
	}

	function invalidateCube() {
		cube = cube;
		//invalidate();
	}

	export let isMoving: Writable<'click' | 'drag' | 'none'>;
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

	async function handlePanEnd() {
		if ($isMoving === 'click') {
			isMoving.set('none');
		} else {
			stopDraggingTimeout = setTimeout(async () => {
				if ($isMoving !== 'none') isMoving.set('none');
			}, dragEndDelay);
		}
		clearPreReveal();
	}

	let lastImageTime = 0;
	const screenShake = new ScreenShake();
	useTask(
		() => {
			screenShake.update(camera.current);
			renderer.render(scene, camera.current);
			if ($gameStore && $gameStore.isGameOver && $imageStore.gameOverImage === '') {
				if ($imageStore.processesingGameOverImage) return;
				takeImageOfCube(true);
				if (!screenShake.isActive() && !$gameStore.isGameWon)
					screenShake.shake(camera.current, new Vector3(-0.5, 0, 0.5), 250);
			} else if ($gameStore && !$gameStore.isGameOver && $imageStore.showcaseMode) {
				if (Date.now() - lastImageTime > 1000) {
					console.log('Taking image');
					takeImageOfCube(false);
					lastImageTime = Date.now();
				}
			}
		},
		{ stage: renderStage, autoInvalidate: false }
	);
	let dist = 0;
	$: {
		if (width !== undefined || height !== undefined || depth !== undefined) {
			dist = Math.max(width, height, depth) / (2 * Math.tan((24 * Math.PI) / 360)) + 1;
		}
	}
</script>

<!--FUTURE NOTE: Bug in threlte/extras/OrbitControls with three version ^0.68.0. Fix is already pulled into main but not published to NPM at time of writing. Please update threejs & thretle/extras when possible -->
<InteractiveScene>
	<T.Cache enabled={true} />
	<Stars speed={1} lightness={0.15} saturation={0} />
	<T.PerspectiveCamera makeDefault position={[dist, dist, dist]} near={0.01} far={1000}>
		<OrbitControls
			enablePan={false}
			enableZoom={true}
			enableRotate={true}
			autoRotate={!isPlaying}
			minDistance={Math.max(width, height, depth) + 5}
			maxDistance={Math.max(width, height, depth) * 3 + dist + 5}
			target={[width / 2 - 0.5, height / 2 - 0.5, depth / 2 - 0.5]}
			on:start={handlePanStart}
			on:end={handlePanEnd}
		/>
	</T.PerspectiveCamera>
	<T.DirectionalLight castShadow position={[3, 10, 10]} />
	<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
	<T.AmbientLight intensity={0.2} />
	<Cube
		bind:shape={cube.cube}
		{handleLeftClick}
		{handleRightClick}
		{handlePointerDown}
		{isMoving}
	/>
</InteractiveScene>
