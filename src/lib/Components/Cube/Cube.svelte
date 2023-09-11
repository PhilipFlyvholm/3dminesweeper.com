<script lang="ts">
	import { loadTexturesIfUnloaded } from '$lib/Textures';
	import { T } from '@threlte/core';
	import type { Writable } from 'svelte/store';
	import Box from '../box.svelte';
	import type { BoxClick, BoxPointerDown } from '$lib/Types/BlockTypes';
	import type { Block } from '$lib/Cube';
	import CubeInstances from './CubeInstances.svelte';
	import type { Texture } from 'three';
	import { afterUpdate, beforeUpdate } from 'svelte';
	export let cube: Block[][][];
	export let handleClick: BoxClick;
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
	let counter = 0
	let time = 0
	beforeUpdate(() => time = performance.now());
	afterUpdate(() => console.log("Rerendering cube: " + (counter++)  + "took " + (performance.now() - time) + "ms"));
	
</script>

<T.Group
	on:click={(e) => {
		handleClick(e.object.position, 'left', e.clientX, e.clientY);
	}}
	on:contextmenu={(e) => {
		handleClick(e.object.position, 'right', e.nativeEvent.clientX, e.nativeEvent.clientY);
	}}
	on:pointerdown={(e) => {
		if (e.nativeEvent.button !== 0) return;
		handlePointerDown(e.object.position);
	}}
>
	{#await loadTexturesIfUnloaded() then textures}
		{#if textures && textures.size !== 0}
			<CubeInstances textures={convertMapToObjectArray(textures)}>
				{#each cube as xAxes, x}
					{#each xAxes as yAxes, y}
						{#each yAxes as block, z}
							{#if block.type !== 'air'}
								{@const randomFlagRotation = (x+y+z)/(cube.length+xAxes.length+yAxes.length) * Math.PI * 2}
								{@const texture = block.texture}
								{@const instanceId = 'block-' + block.texture}
								{#key [x, y, z, texture]}
									<Box
										{instanceId}
										{texture}
										{isMoving}
										{randomFlagRotation}
										position={{ x, y, z }}
										facing={block.facing}
										bind:isFlagged={block.isFlagged}
									/>
								{/key}
							{/if}
						{/each}
					{/each}
				{/each}
			</CubeInstances>
		{/if}
	{/await}
</T.Group>
