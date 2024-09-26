<script lang="ts">
	import { gameStore } from '$lib/Stores/GameStore';
	import { T } from '@threlte/core';
	import { InstancedMesh } from '@threlte/extras';
	import type { Texture } from 'three';

	export let textures: { name: string; texture: Texture }[] = [];
	$: currentTexture = textures.pop();
	$: childTextures = textures;
</script>

{#if currentTexture !== undefined}
	{@const instanceId = 'block-' + currentTexture.name}
	<InstancedMesh
		id={instanceId}
		limit={$gameStore.size.blockAmount}
		range={$gameStore.size.blockAmount}
		frustumCulled={false}
	>
		<T.MeshBasicMaterial map={currentTexture.texture}/>
		<T.BoxGeometry args={[1, 1, 1]} />
		<svelte:self textures={childTextures}>
			<slot />
		</svelte:self>
	</InstancedMesh>
{:else}
	<slot />
{/if}
