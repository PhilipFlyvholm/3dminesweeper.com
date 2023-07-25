<script lang="ts">
	import { getTexture } from '$lib/Textures';
	import { InteractiveObject, T } from '@threlte/core';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import type { Writable } from 'svelte/store';
	import type { Mesh } from 'three';
    export let position = {x: 0, y: 0, z: 0}
    export let texture = 'block_default';
    export let clickCallback:((pos:{x:number, y:number, z:number}, clickType: "left" | "right", ref: Mesh) => void) = () => {};
    export let updateRef:((position:{x:number, y:number, z:number}, ref: Mesh) => void) = () => {};
    export let isMoving:Writable<boolean>;
    let mesh: Mesh;

    onMount(() => {
        updateRef(position, mesh);
    })
	const scale = spring(1);
    $: blockTexture = getTexture(texture);

    isMoving.subscribe(() => {
        if($isMoving && $scale !== 1) $scale = 1;
    })
</script>

	<T.Mesh scale={$scale} position={[position.x, position.y, position.z]} let:ref bind:ref={mesh}>
		<!-- Add interaction -->
		<InteractiveObject
			object={ref}
			interactive
            on:click={(e) => {
                if($isMoving) return
                e.preventDefault();
                clickCallback(position, "left", ref);
                
            }}
            on:contextmenu={(e) => {
                if($isMoving) return
                e.preventDefault();
                clickCallback(position, "right", ref);
            }}
			on:pointerenter={() => {
                if($isMoving) return
				$scale =  1.15 ;
			}}
            on:pointerleave={() => {
                if($isMoving) return
				$scale = 1;
			}}
		/>

		<T.BoxGeometry />
		<T.MeshBasicMaterial map={blockTexture} />
	</T.Mesh>
