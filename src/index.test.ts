import { BlockMap } from '$lib/Utils/BlockMap';
import { calculate3BV } from '$lib/Utils/GenerationUtil';
import { describe, expect, it } from 'vitest';

const addBlock = (cube: BlockMap, x: number, y: number, z: number) => {
	cube.set({x, y, z}, {
		type: 'block',
		x,
		y,
		z,
		isFlagged: false,
		isSweeped: false,
		facing: 'up',
		texture: 'none'
	});
};

const addBomb = (cube:BlockMap, x: number, y: number, z: number) => {
	cube.set({x, y, z}, {
		type: 'bomb',
		x,
		y,
		z,
		isFlagged: false,
		isSweeped: false,
		facing: 'up',
		texture: 'none'
	});
};

describe('3bv test', () => {
	it('should equal one (3x3x3 without bomb)', async () => {
		const cube: BlockMap = new BlockMap();
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) continue;
					addBlock(cube, x, y, z);
				}
			}
		}

		const count = await calculate3BV(cube);
		expect(count).toBe(1);
	});
	it('should equal two (3x3x3 with two bombs next to each other)', async () => {
		const cube: BlockMap = new BlockMap();
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) continue;
					addBlock(cube, x, y, z);
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 1, 0, 0);

		const count = await calculate3BV(cube);
		expect(count).toBe(2);
	});
	it('should equal one (3x3x3 with two bombs opposite to each other)', async () => {
		const cube: BlockMap = new BlockMap();
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) continue;
					addBlock(cube, x, y, z);
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 2, 2, 2);

		const count = await calculate3BV(cube);
		expect(count).toBe(1);
	});
	it('should equal two (3x3x3 with two bombs opposite to each other but on same row)', async () => {
		const cube: BlockMap = new BlockMap();
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) continue;
					addBlock(cube, x, y, z);
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 2, 0, 0);

		const count = await calculate3BV(cube);
		expect(count).toBe(2);
	});
});
