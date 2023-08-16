import { writable } from "svelte/store";

type gameStoreType = {
    gameId: string;
    isPlaying: boolean;
    startTime: number | null;
    isGameOver: boolean;
    isGameWon: boolean;
    endTime?: number;
    clicks: number;
    threeBV: number;
    size: {
        width: number;
        height: number;
        depth: number;
    }
} & ({
    isGameOver: true;
    isGameWon: boolean;
    endTime: number;
    bombs: number;
    image?: string;
} | {
    isGameOver: false;
    isGameWon: false;
})

export const gameStore = writable<gameStoreType>();
export const mouse = writable<{x:number, y:number} | undefined>(undefined)