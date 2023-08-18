<script lang="ts">
	export let size: string;
	export let text: string;
</script>

<div class="p-5 m-auto w-[80%] sm:w-1/2 md:w-1/3">
	<div class="card variant-ghost-primary p-2 text-center w-full">
		<a href={`/play/${size}`} class="group">
			<div class="flex justify-center">
				<img
					src={`/difficulties/cube-${size}.png`}
					alt={`A ${size} cube`}
					class="max-w-[512px] w-[80%] group-hover:w-[85%] m-[5%] group-hover:mx-0 group-hover:my-[2.5%] transition-width duration-200 block"
				/>
			</div>
			<p
				class="p-2 rounded my-1 block variant-filled-primary md:variant-ghost-primary max-w-full whitespace-pre-wrap text-center mx-2 group-hover:variant-filled-primary transition-colors duration-200"
			>
				{text}
			</p>
		</a>
	</div>
</div>
