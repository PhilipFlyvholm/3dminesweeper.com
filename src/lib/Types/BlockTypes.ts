import type { Vector3 } from "three";

export type BoxLeftClick =(
    pos: { x: number; y: number; z: number },
    clientX: number,
    clientY: number,
    point: Vector3
) => void

export type BoxRightClick =(
    pos: { x: number; y: number; z: number },
    clientX: number,
    clientY: number,
    point: Vector3
) => void

export type BoxPointerDown =(
    pos: { x: number; y: number; z: number }
) => void
