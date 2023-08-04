<script lang="ts">
	import type { Block } from '$lib/Types/GameTypes';
	import type { Mesh } from 'three';
	import { T } from '@threlte/core';
	import type { Writable } from 'svelte/store';
	import Box from './box.svelte';
	export let cube: Block[][][];
	export let getTextureForBlock: (x: number, y: number, z: number) => string | undefined;
	export let handleClick: (
		pos: { x: number; y: number; z: number },
		clickType: 'left' | 'right',
		ref: Mesh
	) => void;
	export let updateRef: (position: { x: number; y: number; z: number }, ref: Mesh) => void;
	export let isMoving: Writable<'click' | 'drag' | 'none'>;
</script>

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
</T.Group>
