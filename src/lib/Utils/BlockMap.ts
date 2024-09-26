import type { Block } from '$lib/Cube';

export type Vector3 = { x: number; y: number; z: number };

export const HashVector3 = (v: Vector3) => JSON.stringify(v);
export const UnhashVector3 = (s: string): Vector3 => JSON.parse(s);
export class BlockMap implements Map<Vector3, Block> {
	private map: Map<string, Block>;
	size: number = 0;
	[Symbol.toStringTag]: string = 'BlockMap';

	constructor(entries?: readonly (readonly [Vector3, Block])[] | null) {
		this.map = new Map(entries?.map(([key, value]) => [HashVector3(key), value]));
		this.size = this.map.size;
	}
	clear(): void {
		this.map.clear();
		this.size = this.map.size;
	}
	forEach(
		callbackfn: (value: Block, key: Vector3, map: Map<Vector3, Block>) => void,
		thisArg?: any
	): void {
		this.map.forEach((value, key, map) => callbackfn(value, UnhashVector3(key), this), thisArg);
	}
	entries(): MapIterator<[Vector3, Block]> {
		return this.map.entries().map(([key, value]) => [UnhashVector3(key), value]);
	}
	values(): MapIterator<Block> {
		return this.map.values();
	}
	[Symbol.iterator](): MapIterator<[Vector3, Block]> {
		return this.map[Symbol.iterator]().map(([key, value]) => [UnhashVector3(key), value]);
	}
	get(key: Vector3): Block | undefined {
		const hasedKey = HashVector3(key);
		return this.map.get(hasedKey);
	}

	set(key: Vector3, value: Block): this {
		this.map.set(HashVector3(key), value);
		this.size = this.map.size;
		return this;
	}

	delete(key: Vector3): boolean {
		const hasedKey = HashVector3(key);
		const result = this.map.delete(hasedKey);
		this.size = this.map.size;
		return result;
	}
	has(key: Vector3): boolean {
		const hasedKey = HashVector3(key);
		return this.map.has(hasedKey);
	}

	public keys(): MapIterator<Vector3> {
		return this.map.keys().map(UnhashVector3);
	}
}
