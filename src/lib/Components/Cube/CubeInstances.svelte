<script lang="ts">
	import { gameStore } from '$lib/Stores/GameStore';
	import { T } from '@threlte/core';
	import type { Texture } from 'three';
	import { InstancedMesh } from '@threlte/extras';

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
	>
		<T.MeshBasicMaterial map={currentTexture.texture} />
		<T.BoxGeometry frustumCulled={false} args={[1, 1, 1]} />
        <svelte:self
            textures={childTextures}
        >
            <slot />
        </svelte:self>
	</InstancedMesh>
{:else}
	<slot />
{/if}
