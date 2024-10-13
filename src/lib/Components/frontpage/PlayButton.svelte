<script lang="ts">
	import LinkButton from '../buttons/LinkButton.svelte';

	export let size: string;
	export let text: string;
</script>

<div class="p-1 m-auto w-1/3 sm:w-1/2 md:w-1/3">
	<LinkButton href={`/play/${size}`} title={text} subtitle={size}>
		<svelte:fragment slot="leftSide">
			<div class="relative w-16 h-16">
				<img
					src={`/difficulties/cube-${size}.png`}
					alt={`A ${size} cube`}
					class="w-full h-full transition-width duration-200 block absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] scale-100 group-hover:scale-150 group-hover:rotate-12"
				/>
			</div>
		</svelte:fragment>
	</LinkButton>
</div>
