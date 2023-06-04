import { writable, type Writable } from 'svelte/store';

export const mesoName: Writable<string> = writable();
export const duration = writable(6);
export const startRIR: Writable<number> = writable();
