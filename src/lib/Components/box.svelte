<script lang="ts">
	import { getTexture } from '$lib/Textures';
	import { InteractiveObject, Object3DInstance, T, useLoader } from '@threlte/core';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { writable, type Writable } from 'svelte/store';
	import { Group, type Mesh } from 'three';
	import gameStore from '$lib/Stores/GameStore';
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
	export let position = { x: 0, y: 0, z: 0 };
	export let texture = 'block_default';
	export let clickCallback: (
		pos: { x: number; y: number; z: number },
		clickType: 'left' | 'right',
		ref: Mesh
	) => void = () => {};
	export let updateRef: (
		position: { x: number; y: number; z: number },
		ref: Mesh
	) => void = () => {};
	export let isMoving: Writable<boolean>;
	export let isFlagged: boolean;
	export let facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
	let mesh: Mesh;

	onMount(() => {
		updateRef(position, mesh);
	});
	const scale = spring(1);
	$: blockTexture = getTexture(texture);

	isMoving.subscribe(() => {
		if ($isMoving && $scale !== 1) $scale = 1;
	});
	const mtlLoader = useLoader(MTLLoader, () => new MTLLoader());
	const objLoader = useLoader(OBJLoader, () => new OBJLoader());
	const randomFlagRotation = Math.random() * Math.PI * 2;

	let obj = writable<Group | null>(null);
	onMount(() => {
		mtlLoader.load('http://3dminesweeper.local/models/flag.mtl', (materials) => {
			materials.preload();
			objLoader.setMaterials(materials);
			objLoader.load('http://3dminesweeper.local/models/flag.obj', (group) => {
				group.scale.set(0.003, 0.003, 0.003);
				const g = new Group();
				g.copy(group);
				obj.set(g);
				console.log('loaded', group);
			});
		});
	});
	function isTouchDevice() {
		return (
            // @ts-ignore msMaxTouchPoints is not in the lib
			'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
		);
	}
    const isTouch = isTouchDevice();
</script>

<T.Mesh scale={$scale} position={[position.x, position.y, position.z]} let:ref bind:ref={mesh}>
	<!-- Add interaction -->
	<InteractiveObject
		object={ref}
		interactive
		on:click={(e) => {
			if ($isMoving) return;
			e.preventDefault();
			clickCallback(position, 'left', ref);
		}}
		on:contextmenu={(e) => {
			if ($isMoving) return;
			e.preventDefault();
			clickCallback(position, 'right', ref);
		}}
		on:pointerenter={() => {
			if ($isMoving || isTouch) return;
			if ($gameStore.isPlaying) $scale = 1.15;
		}}
		on:pointerleave={() => {
			if ($isMoving || isTouch) return;
			$scale = 1;
		}}
	/>

	<T.BoxGeometry />
	<T.MeshBasicMaterial map={blockTexture} />
</T.Mesh>
{#if isFlagged && $obj && $obj !== null}
	{@const rotation = {
		up: { x: 0, y: randomFlagRotation, z: 0 },
		down: { x: 0, y: randomFlagRotation, z: Math.PI },
		left: { x: randomFlagRotation, y: 0, z: Math.PI / 2 },
		right: { x: randomFlagRotation, y: 0, z: -Math.PI / 2 },
		front: { x: -Math.PI / 2, y: randomFlagRotation, z: 0 },
		back: { x: Math.PI / 2, y: randomFlagRotation, z: 0 }
	}}
	{@const positionModification = {
		up: { x: 0, y: $scale - 1, z: 0 },
		down: { x: 0, y: 1 - $scale - 1, z: 0 },
		left: { x: -0.5 - ($scale - 1), y: -0.5, z: 0 },
		right: { x: 0.5 + ($scale - 1), y: -0.5, z: 0 },
		front: { x: 0, y: -0.5, z: -0.5 - ($scale - 1) },
		back: { x: 0, y: -0.5, z: 0.5 + ($scale - 1) }
	}}
	<Object3DInstance
		object={$obj}
		position={{
			x: position.x + positionModification[facing].x,
			y: position.y + positionModification[facing].y + 0.5,
			z: position.z + positionModification[facing].z
		}}
		rotation={rotation[facing]}
	/>
{/if}
