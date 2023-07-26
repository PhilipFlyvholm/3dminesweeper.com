<script lang="ts">
    import Game from '$lib/Components/game.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<Game width={data.size.width} height={data.size.height} depth={data.size.depth}/>
