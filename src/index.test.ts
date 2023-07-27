import type { Block, Cube } from '$lib/Types/GameTypes';
import { calculate3BV } from '$lib/Utils/GenerationUtil';
import { describe, expect, it } from 'vitest';

const addBlock = (cube: Cube, x: number, y: number, z: number) => {
	if (!cube[x]) cube[x] = [];
	if (!cube[x][y]) cube[x][y] = [];
	cube[x][y][z] = { type: 'block', x, y, z, isFlagged: false, isSweeped: false, facing: 'up' };
};
const addAir = (cube: Cube, x: number, y: number, z: number) => {
	if (!cube[x]) cube[x] = [];
	if (!cube[x][y]) cube[x][y] = [];
	cube[x][y][z] = { type: 'air', x, y, z };
};
const addBomb = (cube: Cube, x: number, y: number, z: number) => {
	if (!cube[x]) cube[x] = [];
	if (!cube[x][y]) cube[x][y] = [];
	cube[x][y][z] = { type: 'bomb', x, y, z, isFlagged: false, isSweeped: false, facing: 'up' };
};

describe('3bv test', () => {
	it('should equal one (3x3x3 without bomb)', () => {
		const cube: Cube = [];
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) {
						addAir(cube, x, y, z);
					} else {
						addBlock(cube, x, y, z);
					}
				}
			}
		}
		
	
		const count = calculate3BV(cube);
		expect(count).toBe(1);
	});
	it('should equal two (3x3x3 without bomb two bombs next to each other)', () => {
		const cube: Cube = [];
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) {
						addAir(cube, x, y, z);
					} else {
						addBlock(cube, x, y, z);
					}
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 1, 0, 0);
		
	
		const count = calculate3BV(cube);
		expect(count).toBe(2);
	});
	it('should equal one (3x3x3 without bomb two bombs opposite to each other)', () => {
		const cube: Cube = [];
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) {
						addAir(cube, x, y, z);
					} else {
						addBlock(cube, x, y, z);
					}
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 2, 2, 2);
		
	
		const count = calculate3BV(cube);
		expect(count).toBe(1);
	});
	it('should equal two (3x3x3 without bomb two bombs opposite to each other but on same row)', () => {
		const cube: Cube = [];
		//Make a 3x3x3 cube with air in the middle
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (x === 1 && y === 1 && z === 1) {
						addAir(cube, x, y, z);
					} else {
						addBlock(cube, x, y, z);
					}
				}
			}
		}

		addBomb(cube, 0, 0, 0);
		addBomb(cube, 2, 0,0);
		
	
		const count = calculate3BV(cube);
		expect(count).toBe(2);
	});
});
