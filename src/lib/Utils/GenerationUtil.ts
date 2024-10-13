import type { Block } from '$lib/Shape';
import { BlockMap, HashVector3, type Vector3 } from '$lib/Utils/BlockMap';
import Srand from 'seeded-rand';
import { Vector3 as TVector3 } from 'three';

//Polyfill function
async function IteratorToArray<T>(iterator: Iterable<T>) {
	if (Array.fromAsync) return Array.fromAsync(iterator);
	else return Array.from(iterator);
}

/*
	Count3BV is a function that calculate the 3BV of a shape
	3BV is the minimum number of clicks required to open all the cells
	3BV is a measure of the difficulty of a shape
	A shape is a map of blocks (BlockMap) where air blocks are ignored
*/
export async function calculate3BV(shape: BlockMap) {
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
						if (!shape.has(finalCoords)) continue; //If it is not in the shape

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
	const coords = await IteratorToArray(shape.keys());
	// First mark 0 0 2 then 2 0 0
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

export type CreationResult = {
	map: BlockMap;
	size: { width: number; height: number; depth: number; blockAmount: number }; // Note: Maybe should be called VisualSize
};

/**This creates a cube with no core and no bombs */
export function createPlainCube(width: number, height: number, depth: number): CreationResult {
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
				}
			}
		}
	}
	return { map: cube, size: { width, height, depth, blockAmount: cube.size } };
}

export function createShapeTest(): CreationResult {
	const shape: BlockMap = new BlockMap();
	const addBlock = (shape: BlockMap, x: number, y: number, z: number) => {
		shape.set(
			{ x, y, z },
			{
				type: 'block',
				x,
				y,
				z,
				isFlagged: false,
				isSweeped: false,
				facing: 'up',
				texture: 'block_default'
			}
		);
	};

	const addBomb = (shape: BlockMap, x: number, y: number, z: number) => {
		shape.set(
			{ x, y, z },
			{
				type: 'bomb',
				x,
				y,
				z,
				isFlagged: false,
				isSweeped: false,
				facing: 'up',
				texture: 'block_default'
			}
		);
	};
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			for (let z = 0; z < 3; z++) {
				if (x === 1 && y === 1 && z === 1) continue;
				addBlock(shape, x, y, z);
			}
		}
	}

	addBomb(shape, 0, 0, 0);
	addBomb(shape, 1, 0, 0);
	return { map: shape, size: { width: 3, height: 3, depth: 3, blockAmount: shape.size } };
}

export function createPlainSphere(radius: number): CreationResult {
	const offset = 0.5;
	const center = { x: radius - offset, y: radius - offset, z: radius - offset };
	const shape: BlockMap = new BlockMap();
	const R2 = radius ** 2;
	const epsilon = R2 - (radius - 0.5) ** 2;
	const setBlock = ({ x, y, z }: Vector3) => {
		const facing = (() => {
			// Get the direction this block is facing from the center using vectors
			const vector = { x: x - center.x, y: y - center.y, z: z - center.z };
			const xAbs = Math.abs(vector.x);
			const yAbs = Math.abs(vector.y);
			const zAbs = Math.abs(vector.z);
			if (xAbs > yAbs && xAbs > zAbs) return vector.x > 0 ? 'right' : 'left';
			else if (yAbs > xAbs && yAbs > zAbs) return vector.y > 0 ? 'up' : 'down';
			else return vector.z > 0 ? 'back' : 'front';
		})();

		const block: Block = {
			y: y,
			x: x,
			z: z,
			type: 'block',
			isFlagged: false,
			isSweeped: false,
			facing: facing,
			texture: 'block_default'
		};
		shape.set({ x: block.x, y: block.y, z: block.z }, block);
	};

	const innerAirBlocks = new Set<string>();
	for (let x = -radius; x <= radius; x++) {
		for (let y = -radius; y <= radius; y++) {
			for (let z = -radius; z <= radius; z++) {
				const distanceSquared = x ** 2 + y ** 2 + z ** 2;
				const pos: Vector3 = {
					x: x + radius - offset,
					y: y + radius - offset,
					z: z + radius - offset
				};
				if (R2 - epsilon <= distanceSquared && distanceSquared <= R2 + epsilon) {
					setBlock(pos);
				} else if (distanceSquared <= R2 + epsilon) {
					const key = HashVector3(pos);
					innerAirBlocks.add(key);
				}
			}
		}
	}
	const outlineOnlyShape = excludeCore(shape, innerAirBlocks);

	return {
		map: outlineOnlyShape,
		size: {
			width: radius * 2,
			height: radius * 2,
			depth: radius * 2,
			blockAmount: outlineOnlyShape.size
		}
	};
}

function excludeCore(shape: BlockMap, innerAirBlocks = new Set<string>()) {
	const newShape = new BlockMap();
	for (const [coord, block] of shape.entries()) {
		const around = [
			{ x: -1, y: 0, z: 0 },
			{ x: 1, y: 0, z: 0 },
			{ x: 0, y: -1, z: 0 },
			{ x: 0, y: 1, z: 0 },
			{ x: 0, y: 0, z: -1 },
			{ x: 0, y: 0, z: 1 }
		];
		let isValid = false;
		for (let { x, y, z } of around) {
			x += coord.x;
			y += coord.y;
			z += coord.z;
			const key = HashVector3({ x, y, z });
			if (innerAirBlocks.has(key)) continue;
			const block = shape.get({ x, y, z });
			if (!block) {
				isValid = true;
				break;
			}
		}
		if (isValid) newShape.set(coord, block);
	}

	return newShape;
}

function isOutline(x: number, y: number, z: number, width: number, height: number, depth: number) {
	return x === 0 || x === width - 1 || y === 0 || y === height - 1 || z === 0 || z === depth - 1;
}

export async function addBombs(
	initalShape: BlockMap,
	firstClick: { x: number; y: number; z: number },
	bombsAmount: number,
	seed?: number,
	iteration = 0
) {
	const shape = new BlockMap(Array.from(initalShape.entries()));
	const seededRandom = new Srand(seed);
	let estimatedBombsRemaining = 0;

	const possiblePositions = Array.from(shape.keys());
	if (possiblePositions.length === 0) throw new Error('Shape is empty');
	if (possiblePositions.length <= bombsAmount)
		throw new Error('Shape is too small for the amount of bombs');
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
	const difficulty = await calculate3BV(shape);
	console.log('Difficulty', difficulty);

	if (difficulty < bombsAmount + 3 && iteration < 50)
		return addBombs(
			initalShape,
			firstClick,
			bombsAmount,
			seed !== undefined ? seed + 1 : undefined,
			iteration + 1
		);
	return { shape: shape, difficulty, estimatedBombsRemaining, seed: seededRandom.seed };
}
