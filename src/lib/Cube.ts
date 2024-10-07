import type { BlockMap } from '$lib/Utils/BlockMap';
import { addBombs, createPlainCube, createPlainSphere, createShapeTest, type CreationResult } from './Utils/GenerationUtil';

export type Block =
	| {
			x: number;
			y: number;
			z: number;
			type: 'block' | 'bomb';
			isFlagged: boolean;
			isSweeped: boolean;
			texture: string;
			facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
	  }
	| {
			x: number;
			y: number;
			z: number;
			type: 'air';
	  };

export function BlockToString(block: Block) {
	if (block.type === 'air') return 'air';
	return `${block.x} ${block.y} ${block.z}`;
}

export type NonAirBlock = Exclude<Block, { type: 'air' }>;

export class Cube {
	cube: BlockMap;
	bombs: number;
	difficulty?: number;
	size: {
		width: number;
		height: number;
		depth: number;
		blockAmount: number;
	};
	difficultyListeners: ((difficulty: number) => void)[] = [];

	constructor(width: number, height: number, depth: number) {
		/*
			FIXME: LIST OF ISSUES
			- createPlainSphere is not (100%) hollow!
			- Some of "pointy" blocks of the sphere are not clickable (Only two of them)
		*/
		const ShapeCreationResult:CreationResult = createPlainSphere(width);
		const blockAmount = ShapeCreationResult.size.blockAmount;
		this.bombs = Math.min(blockAmount - 1, Math.max(Math.floor(blockAmount / 10), 1));
		this.size = ShapeCreationResult.size
		this.cube = ShapeCreationResult.map;
	}

	getWidth() {
		return this.size.width;
	}

	getHeight() {
		return this.size.height;
	}

	getDepth() {
		return this.size.depth;
	}

	getBlock(x: number, y: number, z: number) {
		if (x < 0 || x >= this.size.width) return undefined;
		if (y < 0 || y >= this.size.height) return undefined;
		if (z < 0 || z >= this.size.depth) return undefined;

		return this.cube.get({ x, y, z });
	}

	setBlock(x: number, y: number, z: number, block: Block) {
		if (x < 0 || x >= this.size.width) return this;
		if (y < 0 || y >= this.size.height) return this;
		if (z < 0 || z >= this.size.depth) return this;
		this.cube.set({ x, y, z }, block);
		this.cube = this.cube;
		return this;
	}

	populate(firstClick: { x: number; y: number; z: number }) {
		const { cube, difficulty, seed, estimatedBombsRemaining } = addBombs(
			this.cube,
			firstClick,
			this.bombs
		);
		this.cube = cube;
		this.difficulty = difficulty;
		this.bombs = estimatedBombsRemaining;
		this.difficultyListeners.forEach((listener) => listener(difficulty));
		return this;
	}

	addDifficultyChangeListener(listener: (difficulty: number) => void) {
		const i = this.difficultyListeners.push(listener);
		return () => {
			this.difficultyListeners.splice(i, 1);
		};
	}
}
