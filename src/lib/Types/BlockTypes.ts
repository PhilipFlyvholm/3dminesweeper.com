import type { Mesh } from "three";

export type BoxClick =(
    pos: { x: number; y: number; z: number },
    clickType: 'left' | 'right',
    ref: Mesh,
    clientX: number,
    clientY: number
) => void