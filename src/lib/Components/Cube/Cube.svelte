<script lang="ts">
	import type { Block } from '$lib/Cube';
	import { loadTexturesIfUnloaded } from '$lib/Textures';
	import type { BoxLeftClick, BoxPointerDown, BoxRightClick } from '$lib/Types/BlockTypes';
	import { T } from '@threlte/core';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Texture } from 'three';
	import Box from '../box.svelte';
	import CubeInstances from './CubeInstances.svelte';
	export let cube: Block[][][] = [];
	export let handleLeftClick: BoxLeftClick;
	export let handleRightClick: BoxRightClick;
	export let handlePointerDown: BoxPointerDown;
	export let isMoving: Writable<'click' | 'drag' | 'none'>;

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
		if(e.object.type !== "Group") return;
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
		{#key cube.length}
			{cube.length}
			{#if textures && textures.size !== 0}
				<CubeInstances textures={convertMapToObjectArray(textures)}>
					{#each cube as xAxes, x}
						{#each xAxes as yAxes, y}
							{#each yAxes as block, z}
								{#if block.type !== 'air'}
									{@const randomFlagRotation =
										((x + y + z) / (cube.length + xAxes.length + yAxes.length)) * Math.PI * 2}
									<Box {block} {isMoving} {randomFlagRotation} isFlagged={block.isFlagged} />
								{/if}
							{/each}
						{/each}
					{/each}
				</CubeInstances>
			{/if}
		{/key}
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</T.Group>
