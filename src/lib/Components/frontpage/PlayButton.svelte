<script lang="ts">
	export let size: string;
	export let text: string;
</script>

<div class="p-1 m-auto w-1/3 sm:w-1/2 md:w-1/3">
	<!--<div class="card variant-ghost-primary p-2 text-center w-full">
		<a href={`/play/${size}`} class="group">
			<div class="flex justify-center">
				<img
					src={`/difficulties/cube-${size}.png`}
					alt={`A ${size} cube`}
					class="max-w-[512px] w-[50%] group-hover:w-[85%] m-[1%] group-hover:mx-0 group-hover:my-[2.5%] transition-width duration-200 block"
				/>
			</div>
			<p
				class="p-2 rounded my-1 block variant-filled-primary md:variant-ghost-primary max-w-full whitespace-pre-wrap text-center mx-2 group-hover:variant-filled-primary transition-colors duration-200"
			>
				{text}
			</p>
		</a>
	</div>-->
	<div class="p-2 text-center w-full max-sm:card max-sm:variant-ghost-primary">
		<a href={`/play/${size}`} class="flex justify-center relative group">
			<img
				src={`/difficulties/cube-${size}.png`}
				alt={`A ${size} cube`}
				class="max-w-[512px] w-[80%] md:w-[80%] group-hover:w-[85%] m-[5%] group-hover:mx-0 group-hover:my-0 transition-width duration-200 block"
			/>
			<div class="absolute top-[50%] translate-y-[-50%] flex flex-1 items-center justify-center">
				<p
					class="flex-1 py-2 px-5 rounded my-1 vt323 text-2xl max-w-full whitespace-pre-wrap text-center mx-2 group-hover:variant-filled-primary transition-colors duration-200"
				>
					{text}
				</p>
			</div>
		</a>
	</div>
</div>
