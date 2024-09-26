import { BlockMap, HashVector3, type Vector3 } from '$lib/Utils/BlockMap';
import Srand from 'seeded-rand';

/*
	Count3BV is a function that calculate the 3BV of a shape
	3BV is the minimum number of clicks required to open all the cells
	3BV is a measure of the difficulty of a shape
	A shape is a map of blocks (BlockMap) where air blocks are ignored
*/
export function calculate3BV(shape: BlockMap) {
	let count = 0;
	const marked: Set<string> = new Set();
	const mark = (coord: Vector3) => {
		marked.add(HashVector3(coord));
	};
	const isMarked = (coord: Vector3) => marked.has(HashVector3(coord));
	const isEmpty = ({ x, y, z }: Vector3) => getBombsAround(x, y, z, shape) === 0;

	const floodFillMark = (initalX: number, initalY: number, initalZ: number) => {
		const localQueue: Vector3[] = [{ x: initalX, y: initalY, z: initalZ }];
		while (localQueue.length > 0) {
			const head = localQueue.pop();
			if (!head) continue;
			const { x, y, z } = head;
			for (let deltaX = -1; deltaX <= 1; deltaX++) {
				for (let deltaY = -1; deltaY <= 1; deltaY++) {
					for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
						if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;
						const finalX = x + deltaX;
						const finalY = y + deltaY;
						const finalZ = z + deltaZ;
						const finalCoords = { x: finalX, y: finalY, z: finalZ };
						if (!shape.has(finalCoords)) continue; //If it is not in the cube

						if (isMarked(finalCoords)) continue;

						mark(finalCoords);
						if (isEmpty(finalCoords)) {
							localQueue.push(finalCoords);
						}
					}
				}
			}
		}
	};
	const coords = shape.keys().toArray();
	for (const coord of coords) {
		const block = shape.get(coord);
		if (!block) continue;
		if (block.type !== 'block') continue;
		if (!isMarked(coord) && isEmpty(coord)) {
			mark(coord);
			count++;

			floodFillMark(coord.x, coord.y, coord.z);
			continue;
		}
	}
	for (const coord of coords) {
		const block = shape.get(coord);
		if (!block) continue;
		if (isMarked(coord) || block.type === 'bomb') continue;
		count++;
	}
	return count;
}

export function getBombsAround(x: number, y: number, z: number, shape: BlockMap) {
	let bombs = 0;
	for (let deltaX = -1; deltaX <= 1; deltaX++) {
		for (let deltaY = -1; deltaY <= 1; deltaY++) {
			for (let deltaZ = -1; deltaZ <= 1; deltaZ++) {
				if (deltaX === 0 && deltaY === 0 && deltaZ === 0) continue;

				const finalX = x + deltaX;
				const finalY = y + deltaY;
				const finalZ = z + deltaZ;

				const block = shape.get({ x: finalX, y: finalY, z: finalZ });
				if (!block) continue;
				if (block.type === 'bomb') bombs++;
			}
		}
	}
	return bombs;
}

/**This creates a cube with no core and no bombs */
export function createPlainCube(width: number, height: number, depth: number): BlockMap {
	const cube: BlockMap = new BlockMap();
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
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
					cube.set(
						{ x, y, z },
						{
							x,
							y,
							z,
							type: 'block',
							isFlagged: false,
							isSweeped: false,
							facing: facing,
							texture: 'block_default'
						}
					);
				} else {
					cube.set(
						{ x, y, z },
						{
							x,
							y,
							z,
							type: 'air'
						}
					);
				}
			}
		}
	}
	return cube;
}

/**This function creates a sphere with no core and no boms */
export function createPlainSphere(radius: number): BlockMap {
	const shape: BlockMap = new BlockMap();
	for (let x = -radius; x <= radius; x++) {
		for (let y = -radius; y <= radius; y++) {
			for (let z = -radius; z <= radius; z++) {
				if (x ** 2 + y ** 2 + z ** 2 <= radius ** 2) {
					shape.set(
						{ x: x + radius, y: y + radius, z: z + radius },
						{
							x: x + radius,
							y: y + radius,
							z: z + radius,
							type: 'block',
							isFlagged: false,
							isSweeped: false,
							facing: 'up',
							texture: 'block_default'
						}
					);
					/*
					if (isOutline(x + radius, y + radius, z + radius, radius * 2, radius * 2, radius * 2)) {
						const facing = (() => {
							if (x === -radius) return 'left';
							else if (x === radius) return 'right';
							else if (y === -radius) return 'down';
							else if (y === radius) return 'up';
							else if (z === -radius) return 'front';
							else return 'back';
						})();

						cube[x + radius][y + radius][z + radius] = {
							x: x + radius,
							y: y + radius,
							z: z + radius,
							type: 'block',
							isFlagged: false,
							isSweeped: false,
							facing: facing,
							texture: 'block_default',
						};
					} else {
						cube[x + radius][y + radius][z + radius] = {
							x: x + radius,
							y: y + radius,
							z: z + radius,
							type: 'air'
						};
					}*/
				}
			}
		}
	}
	return shape;
}

function isOutline(x: number, y: number, z: number, width: number, height: number, depth: number) {
	return x === 0 || x === width - 1 || y === 0 || y === height - 1 || z === 0 || z === depth - 1;
}

export function addBombs(
	initalShape: BlockMap,
	firstClick: { x: number; y: number; z: number },
	bombsAmount: number,
	seed?: number,
	iteration = 0
) {
	const shape = new BlockMap(initalShape.entries().toArray());
	const seededRandom = new Srand(seed);
	let estimatedBombsRemaining = 0;
	console.log(shape.keys, shape.has);

	const possiblePositions = shape.keys().toArray();
	if (possiblePositions.length === 0) throw new Error('Cube is empty');
	if (possiblePositions.length <= bombsAmount)
		throw new Error('Cube is too small for the amount of bombs');
	for (let i = 0; i < bombsAmount; i++) {
		let coord = possiblePositions.at(Math.floor(seededRandom.random() * possiblePositions.length));
		let block = coord ? shape.get(coord) : undefined;
		while (
			!coord ||
			!block ||
			(coord.x === firstClick.x && coord.y === firstClick.y && coord.z === firstClick.z)
		) {
			coord = possiblePositions.at(Math.floor(seededRandom.random() * possiblePositions.length));
			block = coord ? shape.get(coord) : undefined;
		}
		if (block.type === 'block') {
			shape.set(coord, {
				...block,
				type: 'bomb'
			});
			possiblePositions.splice(possiblePositions.indexOf(coord), 1);
			estimatedBombsRemaining++;
		} else {
			i--;
		}
	}
	const difficulty = calculate3BV(shape);

	if (difficulty < bombsAmount + 3 && iteration < 50)
		return addBombs(
			initalShape,
			firstClick,
			bombsAmount,
			seed !== undefined ? seed + 1 : undefined,
			iteration + 1
		);
	return { cube: shape, difficulty, estimatedBombsRemaining, seed: seededRandom.seed };
}
