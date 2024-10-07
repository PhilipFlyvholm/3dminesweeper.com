<script lang="ts">
	import { BlockToString, type Block } from '$lib/Cube';
	import { loadTexturesIfUnloaded } from '$lib/Textures';
	import type { BoxLeftClick, BoxPointerDown, BoxRightClick } from '$lib/Types/BlockTypes';
	import { T } from '@threlte/core';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Texture } from 'three';
	import Box from '../box.svelte';
	import CubeInstances from './ShapeInstances.svelte';
	import { BlockMap, type Vector3 } from '$lib/Utils/BlockMap';
	export let shape: BlockMap = new BlockMap();
	export let handleLeftClick: BoxLeftClick;
	export let handleRightClick: BoxRightClick;
	export let handlePointerDown: BoxPointerDown;
	export let isMoving: Writable<'click' | 'drag' | 'none'>;
	import { shapeInspectorStore } from '$lib/Stores/DevStore';

	function convertMapToObjectArray(
		map: Map<string, Texture>
	): { name: string; texture: Texture }[] {
		const array: { name: string; texture: Texture }[] = [];
		map.forEach((value, key) => {
			array.push({ name: key, texture: value });
		});
		return array;
	}

	let counter = 0;
	let time = 0;
	beforeUpdate(() => (time = performance.now()));
	afterUpdate(() =>
		console.log('Rerendering cube: ' + counter++ + 'took ' + (performance.now() - time) + 'ms')
	);
</script>

<T.Group
	on:pointerup={(e) => {
		if (e.object.type !== 'Group') return;
		e.stopPropagation();

		if (e.nativeEvent.button === 0) {
			handleLeftClick(e.object.position, e.nativeEvent.clientX, e.nativeEvent.clientY, e.point);
		} else if (e.nativeEvent.button === 2) {
			handleRightClick(e.object.position, e.nativeEvent.clientX, e.nativeEvent.clientY, e.point);
		}
	}}
	on:pointerdown={(e) => {
		if (e.nativeEvent.button !== 0) return;
		e.stopPropagation();
		handlePointerDown(e.object.position);
	}}
>
	{#await loadTexturesIfUnloaded()}
		<!-- promise is pending -->
		<p>loading...</p>
		<T.BoxGeometry args={[1, 1, 1]} />
	{:then textures}
		{#if textures && textures.size !== 0}
			{#key shape.size}
				<CubeInstances textures={convertMapToObjectArray(textures)}>
					{#each shape as [coord, block]}
						{#if block.type !== 'air'}
							{@const randomFlagRotation =
								((coord.x + coord.y + coord.z) / shape.size) * Math.PI * 2}
							{#if $shapeInspectorStore.enableSplit == false || block.x > $shapeInspectorStore.splitAt}
								<Box {block} {isMoving} {randomFlagRotation} isFlagged={block.isFlagged || block.type == "bomb"} />
							{/if}
						{/if}
					{/each}
				</CubeInstances>
			{/key}
		{/if}
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</T.Group>
