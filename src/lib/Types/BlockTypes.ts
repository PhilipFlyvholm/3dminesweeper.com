
export type BoxLeftClick =(
    pos: { x: number; y: number; z: number },
    clientX: number,
    clientY: number
) => void

export type BoxRightClick =(
    pos: { x: number; y: number; z: number },
    clientX: number,
    clientY: number
) => void

export type BoxPointerDown =(
    pos: { x: number; y: number; z: number }
) => void
