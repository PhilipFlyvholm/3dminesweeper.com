import type { Block } from "$lib/Cube";
import Srand from 'seeded-rand';

/*
	Count3BV is a function that calculate the 3BV of a cube
	3BV is the minimum number of clicks required to open all the cells
	3BV is a measure of the difficulty of a cube
	A cube is a 3D array of blocks (Block[][][]) where air blocks can be ignored
*/
export function calculate3BV(cube: Block[][][]) {
	let count = 0;
	const marked: boolean[][][] = [];
	const mark = (x: number, y: number, z: number) => {
		if (!marked[x]) marked[x] = [];
		if (!marked[x][y]) marked[x][y] = [];
		if (marked[x][y][z]) return;
		marked[x][y][z] = true;
	};
	const isMarked = (x: number, y: number, z: number) => marked[x]?.[y]?.[z] ?? false;
	const isEmpty = (x: number, y: number, z: number) => getBombsAround(x, y, z, cube) === 0;

	const floodFillMark = (initalX: number, initalY: number, initalZ: number) => {
		const localQueue = [{ x: initalZ, y: initalY, z: initalZ }]
		while (localQueue.length > 0) {
			const head = localQueue.pop()
			if (!head) continue
			const { x, y, z } = head
			for (let deltaX = -1; deltaX <= 1; deltaX++) {
				for (let deltaY = -1; deltaY <= 1; deltaY++) {
					for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
						if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;
						const finalX = x + deltaX;
						const finalY = y + deltaY;
						const finalZ = z + deltaZ;
						if (!cube[finalX]?.[finalY]?.[finalZ]) continue; //If it is not in the cube

						if (isMarked(finalX, finalY, finalZ)) continue;

						mark(finalX, finalY, finalZ);
						if (isEmpty(finalX, finalY, finalZ)) {
							localQueue.push({ x: finalX, y: finalY, z: finalZ })
						}
					}
				}
			}
		}
	};

	for (let x = 0; x < cube.length; x++) {
		for (let y = 0; y < cube[x].length; y++) {
			for (let z = 0; z < cube[x][y].length; z++) {
				const block = cube[x][y][z];
				if (block.type !== 'block') continue;
				if (!isMarked(x, y, z) && isEmpty(x, y, z)) {
					mark(x, y, z);
					count++;

					floodFillMark(x, y, z);
					continue;
				}
			}
		}
	}
	for (let x = 0; x < cube.length; x++) {
		for (let y = 0; y < cube[x].length; y++) {
			for (let z = 0; z < cube[x][y].length; z++) {
				const block = cube[x][y][z];
				if (isMarked(x, y, z) || block.type === 'bomb') continue;

				count++;
			}
		}
	}
	return count;
}

export function getBombsAround(x: number, y: number, z: number, cube: Block[][][]) {
	let bombs = 0;
	const width = cube.length;
	if (width === 0 || !cube[x]) return 0;
	const height = cube[x].length;
	if (height === 0 || !cube[x][y]) return 0;
	const depth = cube[x][y].length;
	if (depth === 0 || !cube[x][y][z]) return 0;
	for (let deltaX = -1; deltaX <= 1; deltaX++) {
		for (let deltaY = -1; deltaY <= 1; deltaY++) {
			for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
				if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;

				const finalX = x + deltaX;
				const finalY = y + deltaY;
				const finalZ = z + deltaZ;
				if (finalX < 0 || finalX >= width) continue;
				if (finalY < 0 || finalY >= height) continue;
				if (finalZ < 0 || finalZ >= depth) continue;

				const block = cube[finalX][finalY][finalZ];
				if (!block) continue;
				if (block.type === 'bomb') bombs++;
			}
		}
	}
	return bombs;
}


/**This creates a cube with no core and no bombs */
export function createPlainCube(
	width: number,
	height: number,
	depth: number,
): Block[][][] {
	const cube: Block[][][] = [];
	for (let x = 0; x < width; x++) {
		cube[x] = [];
		for (let y = 0; y < height; y++) {
			cube[x][y] = [];
			for (let z = 0; z < depth; z++) {
				if (isOutline(x, y, z, width, height, depth)) {
					const facing = (() => {
						if (x === 0) return 'left';
						else if (x === width - 1) return 'right';
						else if (y === 0) return 'down';
						else if (y === height - 1) return 'up';
						else if (z === 0) return 'front';
						else return 'back';
					})();

					cube[x][y][z] = {
						x,
						y,
						z,
						type: 'block',
						isFlagged: false,
						isSweeped: false,
						facing: facing,
						texture: 'block_default',
					};
				} else {
					cube[x][y][z] = {
						x,
						y,
						z,
						type: 'air'
					};
				}
			}
		}
	}
	return cube;
}
function isOutline(x: number, y: number, z: number, width: number, height: number, depth: number) {
	return x === 0 || x === width - 1 || y === 0 || y === height - 1 || z === 0 || z === depth - 1;
}

export function addBombs(initalCube: Block[][][], firstClick: { x: number, y: number, z: number }, bombsAmount: number, seed?: number, iteration = 0) {
	const cube = JSON.parse(JSON.stringify(initalCube)) as Block[][][];
	const width = cube.length;
	const height = cube[0].length;
	const depth = cube[0][0].length;
	const seededRandom = new Srand(seed);
	let estimatedBombsRemaining = 0;
	const bombLocs: { x: number; y: number; z: number }[] = [];

	for (let i = 0; i < bombsAmount; i++) {
		let x = Math.floor(seededRandom.random() * width);
		let y = Math.floor(seededRandom.random() * height);
		let z = Math.floor(seededRandom.random() * depth);
		while (
			bombLocs.find((loc) => loc.x === x && loc.y === y && loc.z === z) ||
			!isOutline(x, y, z, width, height, depth) ||
			(x === firstClick.x && y === firstClick.y && z === firstClick.z)
		) {
			x = Math.floor(seededRandom.random() * width);
			y = Math.floor(seededRandom.random() * height);
			z = Math.floor(seededRandom.random() * depth);
		}
		const block = cube[x][y][z];
		if (block.type === 'block') {
			cube[x][y][z] = {
				...block,
				type: 'bomb',
			};
			estimatedBombsRemaining++;
		} else {
			i--;
		}
	}
	const difficulty = calculate3BV(cube);

	if (difficulty < bombsAmount + 3 && iteration < 50)
		return addBombs(initalCube, firstClick, bombsAmount, seed !== undefined ? seed + 1 : undefined, iteration + 1);
	return { cube, difficulty, estimatedBombsRemaining, seed: seededRandom.seed };

}
