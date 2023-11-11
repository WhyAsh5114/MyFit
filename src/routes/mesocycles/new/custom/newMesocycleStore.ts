import { writable } from 'svelte/store';

export const mesocycleName = writable('');
export const mesocycleDuration = writable(8);
export const mesocycleStartRIR = writable(3);
export const mesocycleFatLossPhase = writable(false);
