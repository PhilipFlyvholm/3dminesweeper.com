<script lang="ts">
    import Game from '$lib/Components/game.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    let { width, height, depth } = data.size;
</script>
{#if width*height*depth > 3375}
    <!--Too big max is 15x15x15-->
    <h1 class="h1 text-center my-5">That is a too big of a cube to draw</h1>
    <p class="text-center">For performance reasons a limit has been set to a cube that is equilivant to 15x15x15.</p>
{:else}
    <Game width={width} height={height} depth={depth}/>
{/if}