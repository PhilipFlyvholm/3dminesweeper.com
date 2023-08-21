import { createCube } from "./Utils/GenerationUtil";

export type Block =
    | {
        x: number;
        y: number;
        z: number;
        type: 'block' | 'bomb';
        isFlagged: boolean;
        isSweeped: boolean;
        facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
    }
    | {
        x: number;
        y: number;
        z: number;
        type: 'air';
    };

export class Cube {
    cube: Block[][][];
    bombs: number;
    difficulty: number;
    size: { 
        width: number;
        height: number;
        depth: number;
    }

    constructor(width: number, height: number, depth: number) {
        const blockAmount =
            width * height * depth -
            Math.max(width - 2, 0) * Math.max(height - 2, 0) * Math.max(depth - 2, 0);
        const bombsAmount = Math.max(Math.floor(blockAmount / 10), 1);
        const cubeCreation = createCube(width, height, depth, bombsAmount);
        this.cube = cubeCreation.cube;
        this.bombs = cubeCreation.estimatedBombsRemaining;
        this.difficulty = cubeCreation.difficulty;
        this.size = {
            width,
            height,
            depth
        }

    }

    getWidth() {
       return this.size.width
    }

    getHeight() {
        return this.size.height
    }

    getDepth() {
        return this.size.depth
    }

    getBlock(x: number, y: number, z: number) {
        if (x < 0 || x >= this.size.width) return undefined;
		if (y < 0 || y >= this.size.height) return undefined;
		if (z < 0 || z >= this.size.depth) return undefined;
        return this.cube[x][y][z];
    }

    setBlock(x: number, y: number, z: number, block: Block) {
        if (x < 0 || x >= this.size.width) return this;
        if (y < 0 || y >= this.size.height) return this;
        if (z < 0 || z >= this.size.depth) return this;
        this.cube[x][y][z] = block;
        return this
    }
}