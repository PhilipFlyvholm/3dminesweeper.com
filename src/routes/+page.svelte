<script>
	import VideoLink from '$lib/Components/frontpage/videoLink.svelte';
</script>

<section class="card variant-ghost-primary p-5 my-5 w-[90%] md:w-[80%] lg:w-[70%] m-auto">
	<h1 class="h1 text-center p-0 vt323">3D Minesweeper</h1>
	<p class="text-center font-bold my-5">Select a difficulty</p>
	<div class="flex flex-wrap justify-between w-full">
		<VideoLink sources={['/videos/3x3x3/output.webm','/videos/3x3x3/output.mp4']} poster="/videos/3x3x3/output.jpeg" href="/play/3x3x3" text="3x3x3" />
		<VideoLink sources={['/videos/5x5x5/output.webm','/videos/5x5x5/output.mp4']} poster="/videos/5x5x5/output.jpeg" href="/play/5x5x5" text="5x5x5" />
		<VideoLink sources={['/videos/10x10x10/output.webm', '/videos/10x10x10/output.mp4']} poster="/videos/10x10x10/output.jpeg" href="/play/10x10x10" text="10x10x10" />
	</div>
</section>
<section class="card variant-ghost-primary py-5 px-5 md:px-10 my-5 w-[90%] md:w-[80%] lg:w-[70%] m-auto">
	<h2 class="h2 text-center">How to play 3D Minesweeper</h2>
	<p class="md:text-center">
		Welcome to the exciting world of 3D Minesweeper! This guide will walk you through the rules and
		gameplay of this thrilling twist on the classic Minesweeper game in three dimensions. Get ready
		to uncover hidden treasures and navigate through challenging mines!
	</p>

	<h3 class="h3">Objective</h3>
	<p>
		The objective of 3D Minesweeper is to clear the playing area without detonating any mines. You
		win the game when all non-mine cells are revealed. Be careful, as one wrong move could lead to a
		devastating explosion!
	</p>

	<h3 class="h3">Gameplay</h3>
	<ol>
		<li>
			<strong>The Game Board</strong>
			<p>
				The game is played on a 3D grid, where each cell can either contain a mine or a number
				representing the number of adjacent mines.
			</p>
		</li>
		<li>
			<strong>Revealing Cells</strong>
			<p>
				To reveal a cell, simply click on it. If it's a mine, the game is over, and you'll have to
				start again. If the cell is not a mine, a number will be displayed. This number indicates
				the count of mines in the neighboring cells.
			</p>
		</li>
		<li>
			<strong>Using Clues</strong>
			<p>
				The numbers revealed on the board are crucial clues to help you avoid mines. Use these
				numbers to deduce the locations of mines and make strategic decisions.
			</p>
		</li>
		<li>
			<strong>Flagging Mines</strong>
			<p>
				If you suspect a cell contains a mine, right-click on it to place a flag. This helps you
				remember the potential mine locations and prevents accidental clicks.
			</p>
		</li>
		<li>
			<strong>Adjacent Cells</strong>
			<p>
				If a cell has a "0" on it, it means there are no mines in its neighboring cells. When you
				reveal such a cell, it will automatically expand to reveal adjacent cells until numbered
				cells are reached.
			</p>
		</li>
		<li>
			<strong>Winning the Game</strong>
			<p>
				To win, reveal all non-mine cells on the grid. Once you've successfully cleared the board,
				celebrate your victory!
			</p>
		</li>
		<li>
			<strong>Practice Makes Perfect</strong>
			<p>
				The more you play, the better you'll get at recognizing patterns and making informed
				decisions. Don't get discouraged by initial losses; instead, use them as learning
				opportunities.
			</p>
		</li>
	</ol>

	<h3 class="h3">Tips for Success</h3>
	<ol>
		<li>
			<strong>Start with Safe Cells</strong>
			<p>
				Begin by revealing cells that are surrounded by the fewest neighbors. These cells are
				usually safer to click on.
			</p>
		</li>
		<li>
			<strong>Use Clues Wisely</strong>
			<p>
				Pay close attention to the numbers revealed on the board. They provide essential information
				about mine locations. Analyze the patterns and use them to make educated guesses.
			</p>
		</li>
		<li>
			<strong>Flag Strategically</strong>
			<p>
				Flag cells you suspect might contain mines. This helps you keep track of potential hazards
				and prevents accidental clicks.
			</p>
		</li>
		<li>
			<strong>Stay Calm and Focused</strong>
			<p>
				3D Minesweeper can be challenging, but maintaining composure and focus will help you make
				better decisions.
			</p>
		</li>
		<li>
			<strong>Practice, Practice, Practice</strong>
			<p>
				The more you play, the better your skills will become. Challenge yourself with different
				grid sizes and difficulties to improve your strategic thinking.
			</p>
		</li>
	</ol>
</section>


