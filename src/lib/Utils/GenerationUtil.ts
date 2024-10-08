import type { Block } from '$lib/Cube';
import { BlockMap, HashVector3, type Vector3 } from '$lib/Utils/BlockMap';
import Srand from 'seeded-rand';
import { Vector3 as TVector3 } from 'three';

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
	shape.set(
		{ x: 0, y: 0, z: 0 },
		{
			x: 0,
			y: 0,
			z: 0,
			type: 'block',
			isFlagged: false,
			isSweeped: false,
			facing: 'up',
			texture: 'block_default'
		}
	);
	shape.set(
		{ x: 0, y: 1, z: 0 },
		{
			x: 0,
			y: 1,
			z: 0,
			type: 'block',
			isFlagged: false,
			isSweeped: false,
			facing: 'left',
			texture: 'block_default'
		}
	);
	return { map: shape, size: { width: 1, height: 2, depth: 1, blockAmount: shape.size } };
}

export function createPlainSphere(radius: number): CreationResult {
	const center = { x: radius - 0.5, y: radius - 0.5, z: radius - 0.5 };
	const shape: BlockMap = new BlockMap();
	const R2 = radius ** 2;
	const epsilon = R2 - (radius - 0.5) ** 2;
	const setBlock = (x: number, y: number, z: number) => {
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
	}

	for(let x = -radius; x <= radius; x++) {
		for(let y = -radius; y <= radius; y++) {
			for(let z = -radius; z <= radius; z++) {
				const distanceSquared = x**2 + y**2 + z**2;
				if(R2 - epsilon <= distanceSquared && distanceSquared <= R2 + epsilon) {
					setBlock(x + radius, y + radius, z + radius);
				}
			}
		}
	}
	const outlineOnlyShape = excludeCore(shape, {x: radius, y: radius, z: radius });

	return {
		map: outlineOnlyShape,
		size: { width: radius * 2, height: radius * 2, depth: radius * 2, blockAmount: outlineOnlyShape.size }
	};
}

function excludeCore(shape: BlockMap, center: Vector3){
	const newShape = new BlockMap()
	const queue = [center];
	const visited = new Set<string>();
	const airBlocks = new Set<string>();
	while(queue.length > 0){
		const head = queue.pop();
		if(!head) continue;
		const {x, y, z}:Vector3 = head;
		const key = HashVector3(head);
		if(visited.has(key)) continue;
		visited.add(key);

		const block = shape.get(head);
		if(!block){
			airBlocks.add(key);
			queue.push({x: x + 1, y, z});
			queue.push({x: x - 1, y, z});
			queue.push({x, y: y + 1, z});
			queue.push({x, y: y - 1, z});
			queue.push({x, y, z: z + 1});
			queue.push({x, y, z: z - 1});
		}
	}
	
	for(const [coord, block] of shape.entries()){
		const around = [{x:-1,y: 0,z: 0}, {x: 1, y: 0, z: 0}, {x: 0, y: -1, z: 0}, {x: 0, y: 1, z: 0}, {x: 0, y: 0, z: -1}, {x: 0, y: 0, z: 1}];
		let isValid = false;
		for (let {x, y, z} of around){
			x += coord.x;
			y += coord.y;
			z += coord.z;
			const key = HashVector3({x, y, z});
			if(airBlocks.has(key)) continue;
			const block = shape.get({x, y, z});
			if(!block){
				isValid = true;
				break;
			}
		}
		if(isValid) newShape.set(coord, block);
	}

	return newShape;
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
