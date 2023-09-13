<script lang="ts">
	import { gameStore } from '$lib/Stores/GameStore';
	import { getModel } from '$lib/Models';
	import { isTouchDevice } from '$lib/Utils/DeviceUtil';
	import { T, HierarchicalObject } from '@threlte/core';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { writable, type Writable } from 'svelte/store';
	import type { Group } from 'three';
	import { Instance } from '@threlte/extras';
	import type { PositionMesh } from '@threlte/extras/dist/components/Instancing/PositionMesh';
	import type {  NonAirBlock } from '$lib/Cube';

	export let block: NonAirBlock;
	export let isMoving: Writable<'click' | 'drag' | 'none'>;
	export let isFlagged: boolean;
	export let randomFlagRotation = 0;
	const scale = spring(1);
	const isTouch = isTouchDevice();
	let mesh: PositionMesh;
	let flag = writable<Group | null>(null);
	$: position = {x: block.x, y: block.y, z: block.z};
	$: instanceId = 'block-' + block.texture;
	$: facing = block.facing;
	onMount(async () => {
		$flag = await getModel('flag');
	});

	isMoving.subscribe(() => {
		if ($isMoving && $scale !== 1) $scale = 1;
	});
</script>
{#key instanceId}
<Instance
	id={instanceId}
	scale={$scale}
	position={[position.x, position.y, position.z]}
	bind:ref={mesh}
	on:pointerenter={() => {
		if ($isMoving !== 'none' || isTouch) return;
		if ($gameStore.isPlaying) $scale = 1.15;
	}}
	on:pointerleave={() => {
		if ($isMoving !== 'none' || isTouch) return;
		$scale = 1;
	}}
/>
{/key}
{#key isFlagged}
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
{/key}
