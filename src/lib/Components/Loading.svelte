<script lang="ts">
	export let progress = 0;
	export let enableRandomLoadingText = false;

	let textFrames = ['Loading', 'Loading.', 'Loading..', 'Loading...'];
	let frame = 0;

	let interval = setInterval(async () => {
		frame = (frame + 1) % textFrames.length;
	}, 500);

	$: if (progress >= 100) {
		clearInterval(interval);
	}

	let randomLoadingMessages = [
		'Adding 1+1',
		'Keep calm and sweep on!',
		'Warning: Mines ahead, proceed with caution!',
		'Channel your inner Indiana Jones and sweep those mines!',
		'Clearing mines like a pro since 2023!',
		'Did you know that Minesweeper is the ultimate brain workout?',
		"We promise, the mines don't bite... much.",
		'Embrace the minefield, become one with the mines!',
		"There's gold in them mines! Or just a lot of explosions...",
		'Ready to decipher the cryptic mine code?',
		"Have you ever outsmarted a minefield? Now's your chance!",
		"Think you're fast? Minesweeping will put you to the test!",
		'Minesweeper: Where every move counts!',
		'Warning: This game contains explosive levels of excitement!',
		"There's no mine too deep for a fearless sweeper like you!"
	];
</script>

<p class="loading text-lg text-center">{textFrames[frame]}</p>
{#if enableRandomLoadingText}
	<p class="text-center">
		{randomLoadingMessages[Math.floor(Math.random() * randomLoadingMessages.length)]}
	</p>
{/if}
<div class="bar-wrapper relative h-[10px] w-[33.33%] border-secondary-500">
	<div class="bar bg-primary-500 h-full" style="width: {progress}%" />
</div>
