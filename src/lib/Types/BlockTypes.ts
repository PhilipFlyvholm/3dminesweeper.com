
export type BoxClick =(
    pos: { x: number; y: number; z: number },
    clickType: 'left' | 'right',
    clientX: number,
    clientY: number
) => void

export type BoxPointerDown =(
    pos: { x: number; y: number; z: number }
) => void
