<script lang="ts">
	import gameStore from '$lib/Stores/GameStore';
	import { getModel } from '$lib/Models';
	import { getTexture } from '$lib/Textures';
	import { isTouchDevice } from '$lib/Utils/DeviceUtil';
	import { T, HierarchicalObject } from '@threlte/core';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { writable, type Writable } from 'svelte/store';
	import type { Group, Mesh, Texture } from 'three';

	export let clickCallback: (
		pos: { x: number; y: number; z: number },
		clickType: 'left' | 'right',
		ref: Mesh
	) => void = () => {};
	export let updateRef: (
		position: { x: number; y: number; z: number },
		ref: Mesh
	) => void = () => {};

	export let position = { x: 0, y: 0, z: 0 };
	export let texture = 'block_default';
	export let isMoving: Writable<'click' | 'drag' | 'none'>;
	export let isFlagged: boolean;
	export let facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';

	const scale = spring(1);
	const randomFlagRotation = Math.random() * Math.PI * 2;
	const isTouch = isTouchDevice();
	let mesh: Mesh;
	let flag = writable<Group | null>(null);
	let blockTexture = writable<Texture | undefined>(undefined);

	onMount(() => {
		updateRef(position, mesh);
	});
	onMount(async () => {
		$flag = await getModel('flag');
		$blockTexture = await getTexture(texture);
	});

	$: getTexture(texture).then((t) => {
		blockTexture.set(t);
	});

	isMoving.subscribe(() => {
		if ($isMoving && $scale !== 1) $scale = 1;
	});
</script>

<T.Mesh
	scale={$scale}
	position={[position.x, position.y, position.z]}
	bind:ref={mesh}
	on:click={(e) => {
		if ($isMoving !== 'none') return;
		clickCallback(position, 'left', mesh);
	}}
	on:contextmenu={(e) => {
		if ($isMoving !== 'none') return;
		clickCallback(position, 'right', mesh);
	}}
	on:pointerenter={() => {
		if ($isMoving !== 'none' || isTouch) return;
		if ($gameStore.isPlaying) $scale = 1.15;
	}}
	on:pointerleave={() => {
		if ($isMoving !== 'none' || isTouch) return;
		$scale = 1;
	}}
>
	<T.BoxGeometry args={[1,1,1]}/>
	{#if $blockTexture && $blockTexture !== undefined}
		<T.MeshBasicMaterial map={$blockTexture} />
	{/if}
</T.Mesh>
{#if isFlagged && $flag && $flag !== null}
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
	<T.Group
		position={[
			position.x + positionModification[facing].x,
			position.y + positionModification[facing].y + 0.5,
			position.z + positionModification[facing].z
		]}
		rotation={[rotation[facing].x, rotation[facing].y, rotation[facing].z]}
	>
		<HierarchicalObject object={$flag} />
	</T.Group>
{/if}
