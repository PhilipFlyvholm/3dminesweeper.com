<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton';
	import DropdownMenu from './DropdownMenu.svelte';
</script>

<AppBar class="z-50 relative"
	><a href="/" class="flex justify-center items-center"
		><img
			src="/icon_transparent.png"
			alt="3DMinesweeper.com's Icon"
			width="auto"
			height="40"
			class="h-[2rem]"
		/>3DMinesweeper.com</a
	>
	<DropdownMenu slot="trail"/>
</AppBar>
