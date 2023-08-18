<script lang="ts">
	import { tutorialSeen } from "$lib/Stores/LocalStorage";

    function close(){
        $tutorialSeen = 'true';
    }
</script>
<div
	class="absolute top-[0.5rem] left-1/2 translate-x-[-50%] card py-2 px-5 rounded w-[90%] sm:w-[50%] flex flex-col z-50"
>
	<div class="flex justify-between items-center mt-1">
		<h2 class="vt323 h1 m-0">How to play</h2>
        <button class="px-3 py-1 variant-ghost-surface rounded-full font-bold" on:click={close}><small>X</small></button>
	</div>
	<h3 class="h4 m-0 mb-1">Clear all cubes without hitting mines.</h3>

	<div class="my-1">
		<ul class="list list-disc">
			<li>
				<span class="w-1 h-1 bg-white block rounded-full mr-1" />Tap on a cube to use the tool
			</li>
			<li><span class="w-1 h-1 bg-white block rounded-full mr-1" />Drag to rotate the cube</li>
		</ul>
		<img
			src="/how-to/tools.png"
			class="max-w-full mx-auto my-1"
			alt="Two buttons to select tools. The first one selects the dig tool and the second one selects the flag tool"
		/>
	</div>
	<div class="flex flex-col">
		<div class="flex items-center">
			<img
				src="/how-to/cube.png"
				class="w-[50%] p-3"
				alt="A 3x3x3 cube with a handfull of cubes revealed showing the either 1 or 2 depending on the amount of adjacent mines"
			/>

			<div class="w-[50%] flex justify-around flex-col">
				<p class="mb-1">Revealed cubes show the adjacent mine count</p>
				<p>The number defines how many adjacent mines there are in 3d</p>
			</div>
		</div>
		<div class="flex items-center">
			<img
				src="/how-to/cube-flagged.png"
				class="w-[50%] p-3"
				alt="A 3x3x3 cube with a suspected mine flagged"
			/>

			<div class="w-[50%] flex justify-around flex-col">
				<p class="mb-1">Empty blocks have no adjacent mines</p>
				<p>Suspected mines can be marked by flagging</p>
			</div>
		</div>
	</div>
	<button class="btn variant-filled-primary" on:click={close}>Play!</button>
</div>
