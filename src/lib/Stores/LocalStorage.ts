import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';
export const tutorialSeen: Writable<string> = localStorageStore('tutorialSeen', 'false');