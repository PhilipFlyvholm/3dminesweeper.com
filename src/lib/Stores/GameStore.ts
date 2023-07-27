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
} & ({
    isGameOver: true;
    isGameWon: boolean;
    endTime: number;
    bombs: number;
} | {
    isGameOver: false;
    isGameWon: false;
})

const gameStore = writable<gameStoreType>();
export default gameStore;