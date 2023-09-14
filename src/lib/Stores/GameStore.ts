import type { UpdatedScores } from "$lib/Leaderboard";
import { writable } from "svelte/store";

export type gameStoreType = {
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
        blockAmount: number;
    }
} & ({
    isGameOver: true;
    isGameWon: boolean;
    endTime: number;
    bombs: number;
    score:{
        updated: UpdatedScores;
        current: {
            clicks: number;
            threeBV: number;
            efficiency: number;
            time: number;
            threeBVPerSecond: number;
        }
    }
} | {
    isGameOver: false;
    isGameWon: false;
})

export const gameStore = writable<gameStoreType>();
export const mouse = writable<{x:number, y:number} | undefined>(undefined)